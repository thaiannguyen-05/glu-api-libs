export interface GluClientHeaders {
  /** Client identifier, sent as `client` header. */
  client: string;
  /** API key, sent as `x-api-key` header. */
  "x-api-key": string;
  /** Auth credential, sent as `authorization` header. */
  authorization: string;
  /** Territory code, sent as `territory` header. */
  territory: string;
  /** API version, sent as `api-version` header. */
  "api-version": string;
  /** Geolocation, sent as `geolocation` header. */
  geolocation: string;
  /**
   * Device current datetime, sent as `device-datetime` header.
   * ISO 8601 WITHOUT offset: `yyyy-mm-ddThh:mm:ss[.sss]` (e.g. `2023-09-14T19:30:00.000`).
   * Use `nowDeviceDateTime()` to build it.
   */
  "device-datetime": string;
}

export interface GluClientOptions {
  baseUrl: string;
  headers: GluClientHeaders;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface Movie {
  id: string;
  title: string;
  year?: number;
}

export interface ListParams {
  query?: string;
  page?: number;
  limit?: number;
}
