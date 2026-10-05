import type { HttpClient } from "../http.js";
import type {
  FilmComingSoon,
  FilmNowShowing,
  FilmsComingSoonParams,
  FilmsComingSoonResponse,
  FilmsComingSoonResult,
  FilmsNowShowingParams,
  FilmsNowShowingResponse,
  FilmsNowShowingResult,
} from "../types.js";

function normalizeFilm<T extends FilmNowShowing>(film: T): T {
  return {
    ...film,
    age_rating: film.age_rating.map((r) => ({ ...r, rating: r.rating.trim() })),
  };
}

function buildQuery(n: number | undefined): string {
  const qs = new URLSearchParams();
  if (n !== undefined) qs.set("n", String(n));
  return qs.size ? `/?${qs.toString()}` : "/";
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
    const res = await this.http.request<FilmsNowShowingResponse | undefined>(
      `/filmsNowShowing${buildQuery(params?.n)}`,
    );
    const films = (res?.films ?? []).map(normalizeFilm);
    if (params?.includeStatus) return { films, status: res?.status };
    return films;
  }

  async comingSoon(params?: FilmsComingSoonParams): Promise<FilmComingSoon[]>;
  async comingSoon(
    params: FilmsComingSoonParams & { includeStatus: true },
  ): Promise<FilmsComingSoonResult>;
  async comingSoon(
    params?: FilmsComingSoonParams & { includeStatus?: boolean },
  ): Promise<FilmComingSoon[] | FilmsComingSoonResult> {
    const res = await this.http.request<FilmsComingSoonResponse | undefined>(
      `/filmsComingSoon${buildQuery(params?.n)}`,
    );
    const films = (res?.films ?? []).map(normalizeFilm);
    if (params?.includeStatus) return { films, status: res?.status };
    return films;
  }
}
