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

export interface FilmReleaseDate {
  release_date: string;
  notes: string | null;
}

export interface FilmAgeRating {
  rating: string;
  age_rating_image: string;
  age_advisory: string;
}

export interface FilmImageMedium {
  film_image: string;
  width: number;
  height: number;
}

export interface FilmImageEntry {
  image_orientation: string;
  region?: string;
  medium: FilmImageMedium;
}

export interface FilmImages {
  poster: Record<string, FilmImageEntry>;
  still: Record<string, FilmImageEntry>;
}

export interface FilmNowShowing {
  film_id: number;
  imdb_id: number;
  imdb_title_id: string;
  film_name: string;
  other_titles: Record<string, string> | null;
  release_dates: FilmReleaseDate[];
  age_rating: FilmAgeRating[];
  film_trailer: string | null;
  synopsis_long: string;
  images: FilmImages;
}

export interface FilmsNowShowingStatus {
  count: number;
  state: string;
  method: string;
  message: string | null;
  request_method: string;
  version: string;
  territory: string;
  device_datetime_sent: string;
  device_datetime_used: string;
}

export interface FilmsNowShowingResponse {
  films: FilmNowShowing[];
  status: FilmsNowShowingStatus;
}

export interface FilmsNowShowingParams {
  /** Max films to return (`?n=`). */
  n?: number;
}

export interface FilmsNowShowingResult {
  films: FilmNowShowing[];
  /** Undefined only on 204 No Content (geolocation outside territory or stale device-datetime). */
  status: FilmsNowShowingStatus | undefined;
}
