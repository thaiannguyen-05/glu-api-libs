export interface GluClientOptions {
  baseUrl: string;
  apiKey?: string;
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
