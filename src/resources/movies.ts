import type { HttpClient } from "../http.js";
import type { ListParams, Movie } from "../types.js";

export class MoviesResource {
  constructor(private http: HttpClient) {}

  list(params?: ListParams): Promise<Movie[]> {
    const qs = new URLSearchParams();
    if (params?.query) qs.set("query", params.query);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const suffix = qs.size ? `?${qs.toString()}` : "";
    return this.http.request<Movie[]>(`/movies${suffix}`);
  }

  get(id: string): Promise<Movie> {
    return this.http.request<Movie>(`/movies/${encodeURIComponent(id)}`);
  }
}
