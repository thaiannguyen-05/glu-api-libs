import type { HttpClient } from "../http.js";
import type {
  FilmAgeRating,
  FilmComingSoon,
  FilmDetails,
  FilmDetailsParams,
  FilmImagesParams,
  FilmImagesResponse,
  FilmNowShowing,
  FilmShowTimesParams,
  FilmShowTimesResponse,
  FilmsComingSoonParams,
  FilmsComingSoonResponse,
  FilmsComingSoonResult,
  FilmsNowShowingParams,
  FilmsNowShowingResponse,
  FilmsNowShowingResult,
} from "../types.js";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function normalizeFilm<T extends { age_rating: FilmAgeRating[] }>(film: T): T {
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

  /** All posters and stills for one film. Response is the image maps plus inline status. */
  async images(params: FilmImagesParams): Promise<FilmImagesResponse> {
    if (!params || !Number.isInteger(params.film_id)) {
      throw new Error("films.images requires film_id as an integer");
    }
    return this.http.request<FilmImagesResponse>("/images/?film_id=" + params.film_id);
  }

  /** Full details for one film. `status` travels inline in the response. */
  async details(params: FilmDetailsParams): Promise<FilmDetails> {
    if (!params || !Number.isInteger(params.film_id)) {
      throw new Error("films.details requires film_id as an integer");
    }
    const res = await this.http.request<FilmDetails>(`/filmDetails/?film_id=${params.film_id}`);
    return normalizeFilm(res);
  }

  /**
   * Showtimes joining one film with its cinemas.
   * Mirror of `cinemas.showTimes`: times here carry `end_time`
   * (not `display_start_time`), and version keys beyond Standard
   * (IMAX, 3D) reference the alternate `film_id`s.
   */
  async showTimes(params: FilmShowTimesParams): Promise<FilmShowTimesResponse> {
    if (!params || !Number.isInteger(params.film_id)) {
      throw new Error("films.showTimes requires film_id as an integer");
    }
    if (typeof params.date !== "string" || !DATE_RE.test(params.date)) {
      throw new Error("films.showTimes requires date as YYYY-MM-DD");
    }
    const qs = new URLSearchParams({
      film_id: String(params.film_id),
      date: params.date,
    });
    if (params.n !== undefined) qs.set("n", String(params.n));
    const res = await this.http.request<FilmShowTimesResponse>(`/filmShowTimes/?${qs.toString()}`);
    return { ...res, film: normalizeFilm(res.film) };
  }
}
