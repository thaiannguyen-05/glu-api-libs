export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body
    }
    const msg =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${res.status}`;
    const code =
      typeof body === "object" && body !== null && "code" in body
        ? String((body as { code: unknown }).code)
        : undefined;
    return new ApiError(msg, res.status, { code, details: body });
  }
}
