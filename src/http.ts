import { ApiError } from "./errors.js";
import type { GluClientOptions } from "./types.js";

export interface HttpClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createHttpClient(options: GluClientOptions): HttpClient {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const timeoutMs = options.timeoutMs ?? 10_000;
  const fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetchFn(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
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
