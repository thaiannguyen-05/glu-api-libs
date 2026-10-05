import { ApiError } from "./errors.js";
import { assertDeviceDateTime } from "./device-datetime.js";
import type { GluClientHeaders, GluClientOptions } from "./types.js";

export interface HttpClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

const REQUIRED_HEADERS: (keyof GluClientHeaders)[] = [
  "client",
  "x-api-key",
  "authorization",
  "territory",
  "api-version",
  "geolocation",
  "device-datetime",
];

export function assertRequiredHeaders(headers: GluClientHeaders): void {
  for (const key of REQUIRED_HEADERS) {
    const value = headers[key];
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`GluClient requires headers["${key}"] as non-empty string`);
    }
  }
  assertDeviceDateTime(headers["device-datetime"]);
}

export function createHttpClient(options: GluClientOptions): HttpClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const timeoutMs = options.timeoutMs ?? 10_000;
  const fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
  assertRequiredHeaders(options.headers);

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchFn(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          client: options.headers.client,
          "x-api-key": options.headers["x-api-key"],
          authorization: options.headers.authorization,
          territory: options.headers.territory,
          "api-version": options.headers["api-version"],
          geolocation: options.headers.geolocation,
          "device-datetime": options.headers["device-datetime"],
          ...(init?.headers ?? {}),
        },
      });

      if (!res.ok) throw await ApiError.fromResponse(res);
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, { code: "timeout" });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  return { request };
}
