import type { HttpClient } from "../http.js";
import type {
  CinemaDetails,
  CinemaDetailsParams,
  CinemaNearby,
  CinemaShowTimesParams,
  CinemaShowTimesResponse,
  CinemasNearbyParams,
  CinemasNearbyResponse,
  CinemasNearbyResult,
} from "../types.js";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class CinemasResource {
  constructor(private http: HttpClient) {}

  /** Full details for one cinema. `status` travels inline in the response. */
  async details(params: CinemaDetailsParams): Promise<CinemaDetails> {
    if (!params || !Number.isInteger(params.cinema_id)) {
      throw new Error("cinemas.details requires cinema_id as an integer");
    }
    return this.http.request<CinemaDetails>(`/cinemaDetails/?cinema_id=${params.cinema_id}`);
  }

  async nearby(params?: CinemasNearbyParams): Promise<CinemaNearby[]>;
  async nearby(params: CinemasNearbyParams & { includeStatus: true }): Promise<CinemasNearbyResult>;
  async nearby(
    params?: CinemasNearbyParams & { includeStatus?: boolean },
  ): Promise<CinemaNearby[] | CinemasNearbyResult> {
    const qs = new URLSearchParams();
    if (params?.n !== undefined) qs.set("n", String(params.n));
    const suffix = qs.size ? `/?${qs.toString()}` : "/";
    const res = await this.http.request<CinemasNearbyResponse | undefined>(
      `/cinemasNearby${suffix}`,
    );
    const cinemas = res?.cinemas ?? [];
    if (params?.includeStatus) return { cinemas, status: res?.status };
    return cinemas;
  }

  /**
   * Showtimes joining one cinema with its films.
   * Note: `film_id` scopes but does not guarantee a single film back.
   */
  async showTimes(params: CinemaShowTimesParams): Promise<CinemaShowTimesResponse> {
    if (!params || !Number.isInteger(params.film_id)) {
      throw new Error("cinemas.showTimes requires film_id as an integer");
    }
    if (!Number.isInteger(params.cinema_id)) {
      throw new Error("cinemas.showTimes requires cinema_id as an integer");
    }
    if (typeof params.date !== "string" || !DATE_RE.test(params.date)) {
      throw new Error("cinemas.showTimes requires date as YYYY-MM-DD");
    }
    const qs = new URLSearchParams({
      film_id: String(params.film_id),
      cinema_id: String(params.cinema_id),
      date: params.date,
    });
    if (params.sort) qs.set("sort", params.sort);
    const res = await this.http.request<CinemaShowTimesResponse>(
      `/cinemaShowTimes/?${qs.toString()}`,
    );
    return {
      ...res,
      films: res.films.map((f) => ({
        ...f,
        age_rating: f.age_rating.map((r) => ({ ...r, rating: r.rating.trim() })),
      })),
    };
  }
}
