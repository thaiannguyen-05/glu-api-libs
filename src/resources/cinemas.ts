import type { HttpClient } from "../http.js";
import type {
  CinemaDetails,
  CinemaDetailsParams,
  CinemaNearby,
  CinemasNearbyParams,
  CinemasNearbyResponse,
  CinemasNearbyResult,
} from "../types.js";

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
}
