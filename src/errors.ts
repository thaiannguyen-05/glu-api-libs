export type ApiErrorCode =
  "bad_request" | "unauthorized" | "forbidden" | "rate_limited" | "gateway_timeout" | "http_error";

const STATUS_DEFAULTS: Record<number, { code: ApiErrorCode; message: string }> = {
  400: {
    code: "bad_request",
    message:
      "Bad request – incorrect api-version or authorization, or invalid resource name, URL structure or query parameter.",
  },
  401: {
    code: "unauthorized",
    message: "Unauthorized – check territory, x-api-key and authorization headers.",
  },
  403: {
    code: "forbidden",
    message:
      "Forbidden – incorrect/missing x-api-key or incorrect API resource. Do not append the resource (e.g. filmsNowShowing) to the base URL.",
  },
  429: {
    code: "rate_limited",
    message: "Too many requests – API quota exceeded. Please contact support.",
  },
  504: {
    code: "gateway_timeout",
    message:
      "Gateway time-out – server issue. Retry, and contact support if it persists for more than a few minutes.",
  },
};

export class ApiError extends Error {
  status: number;
  code?: string;
  /** Value of the `MG-message` response header, when present. */
  mgMessage?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    opts?: { code?: string; mgMessage?: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = opts?.code;
    this.mgMessage = opts?.mgMessage;
    this.details = opts?.details;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body (e.g. empty 204/504)
    }
    const bodyMessage =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : undefined;
    const bodyCode =
      typeof body === "object" && body !== null && "code" in body
        ? String((body as { code: unknown }).code)
        : undefined;

    // MG-message header carries the server explanation (204/400 especially).
    // Headers.get() is case-insensitive, one lookup is enough.
    const mgMessage = res.headers.get("MG-message") ?? undefined;
    const fallback = STATUS_DEFAULTS[res.status];

    const message =
      bodyMessage ?? mgMessage ?? fallback?.message ?? `Request failed with status ${res.status}`;
    const code = bodyCode ?? fallback?.code ?? "http_error";

    return new ApiError(message, res.status, { code, mgMessage, details: body });
  }
}
