import type { HttpClient } from "../http.js";
import type { CinemaDetails, CinemaDetailsParams } from "../types.js";

export class CinemasResource {
  constructor(private http: HttpClient) {}

  /** Full details for one cinema. `status` travels inline in the response. */
  async details(params: CinemaDetailsParams): Promise<CinemaDetails> {
    if (!params || !Number.isInteger(params.cinema_id)) {
      throw new Error("cinemas.details requires cinema_id as an integer");
    }
    return this.http.request<CinemaDetails>(`/cinemaDetails/?cinema_id=${params.cinema_id}`);
  }
}
