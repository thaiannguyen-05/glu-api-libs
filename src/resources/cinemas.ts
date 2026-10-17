import type { HttpClient } from "../http.js";
import type {
  CinemaDetails,
  CinemaDetailsParams,
  CinemaLiveSearch,
  CinemaLiveSearchParams,
  CinemaLiveSearchResponse,
  CinemaLiveSearchResult,
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
   * Showtimes joining one cinema with its films (`GET /cinemaShowTimes/`).
   * - Scenario 1: `cinema_id` + `date` + `film_id` returns showtimes for that combination.
   * - Scenario 2: `cinema_id` + `date` only returns showtimes for ALL films at that cinema.
   * Note: `film_id` scopes but does not guarantee a single film back.
   * `date` is YYYY-MM-DD in the cinema's published schedule. In line with industry
   * practice the 24h period is 03:00-02:59, so post-midnight times still belong to
   * the requested date. Past times are filtered server-side via `device-datetime`.
   * Response is safe to cache by `cinema_id` + `date` (+ `film_id`, `sort`).
   */
  async liveSearch(params: CinemaLiveSearchParams): Promise<CinemaLiveSearch[]>;
  async liveSearch(
    params: CinemaLiveSearchParams & { includeStatus: true },
  ): Promise<CinemaLiveSearchResult>;
  /**
   * Cinema names / towns matching a search string (`GET /cinemaLiveSearch/`).
   * Best with the global `geolocation` header (results within ~75 miles carry `distance`).
   * Do NOT cache results; callers should debounce search-as-you-type
   * (e.g. delay until pause, or submit every 3-4 chars) to save quota.
   */
  async liveSearch(
    params: CinemaLiveSearchParams & { includeStatus?: boolean },
  ): Promise<CinemaLiveSearch[] | CinemaLiveSearchResult> {
    if (typeof params?.query !== "string" || params.query.trim().length < 3) {
      throw new Error("cinemas.liveSearch requires query as a string with at least 3 characters");
    }
    if (
      params.n !== undefined &&
      (!Number.isInteger(params.n) || params.n < 1 || params.n > 25)
    ) {
      throw new Error("cinemas.liveSearch requires n as an integer between 1 and 25 when provided");
    }
    const qs = new URLSearchParams({ query: params.query.trim() });
    if (params.n !== undefined) qs.set("n", String(params.n));
    const res = await this.http.request<CinemaLiveSearchResponse | undefined>(
      `/cinemaLiveSearch/?${qs.toString()}`,
    );
    const cinemas = res?.cinemas ?? [];
    if (params.includeStatus) return { cinemas, status: res?.status };
    return cinemas;
  }

  async showTimes(params: CinemaShowTimesParams): Promise<CinemaShowTimesResponse> {
    if (!params || !Number.isInteger(params.cinema_id)) {
      throw new Error("cinemas.showTimes requires cinema_id as an integer");
    }
    if (typeof params.date !== "string" || !DATE_RE.test(params.date)) {
      throw new Error("cinemas.showTimes requires date as YYYY-MM-DD");
    }
    if (params.film_id !== undefined && !Number.isInteger(params.film_id)) {
      throw new Error("cinemas.showTimes requires film_id as an integer when provided");
    }
    if (
      params.sort !== undefined &&
      params.sort !== "popularity" &&
      params.sort !== "alphabetical"
    ) {
      throw new Error('cinemas.showTimes sort must be "popularity" or "alphabetical"');
    }
    const qs = new URLSearchParams();
    if (params.film_id !== undefined) qs.set("film_id", String(params.film_id));
    qs.set("cinema_id", String(params.cinema_id));
    qs.set("date", params.date);
    if (params.sort) qs.set("sort", params.sort);
    const res = await this.http.request<CinemaShowTimesResponse | undefined>(
      `/cinemaShowTimes/?${qs.toString()}`,
    );
    if (!res) return { cinema: undefined, films: [], status: undefined } as unknown as CinemaShowTimesResponse;
    return {
      ...res,
      films: res.films.map((f) => ({
        ...f,
        age_rating: f.age_rating.map((r) => ({ ...r, rating: r.rating.trim() })),
      })),
    };
  }
}
