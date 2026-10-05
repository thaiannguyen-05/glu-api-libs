import type { HttpClient } from "../http.js";
import type {
  FilmNowShowing,
  FilmsNowShowingParams,
  FilmsNowShowingResponse,
  FilmsNowShowingResult,
} from "../types.js";

function normalizeFilm(film: FilmNowShowing): FilmNowShowing {
  return {
    ...film,
    age_rating: film.age_rating.map((r) => ({ ...r, rating: r.rating.trim() })),
  };
}

export class FilmsResource {
  constructor(private http: HttpClient) {}

  async nowShowing(params?: FilmsNowShowingParams): Promise<FilmNowShowing[]>;
  async nowShowing(
    params: FilmsNowShowingParams & { includeStatus: true },
  ): Promise<FilmsNowShowingResult>;
  async nowShowing(
    params?: FilmsNowShowingParams & { includeStatus?: boolean },
  ): Promise<FilmNowShowing[] | FilmsNowShowingResult> {
    const qs = new URLSearchParams();
    if (params?.n !== undefined) qs.set("n", String(params.n));
    const suffix = qs.size ? `/?${qs.toString()}` : "/";
    const res = await this.http.request<FilmsNowShowingResponse | undefined>(
      `/filmsNowShowing${suffix}`,
    );
    const films = (res?.films ?? []).map(normalizeFilm);
    if (params?.includeStatus) return { films, status: res?.status };
    return films;
  }
}
