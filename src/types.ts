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

/** A coming-soon film. Item shape is identical to `FilmNowShowing`. */
export type FilmComingSoon = FilmNowShowing;

export interface FilmsComingSoonStatus {
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

export interface FilmsComingSoonResponse {
  films: FilmComingSoon[];
  status: FilmsComingSoonStatus;
}

export interface FilmsComingSoonParams {
  /** Max films to return (`?n=`). */
  n?: number;
}

export interface FilmsComingSoonResult {
  films: FilmComingSoon[];
  /** Undefined only on 204 No Content (geolocation outside territory or stale device-datetime). */
  status: FilmsComingSoonStatus | undefined;
}

export interface FilmGenre {
  genre_id: number;
  genre_name: string;
}

export interface FilmCastMember {
  cast_id: number;
  cast_name: string;
}

export interface FilmDirector {
  director_id: number;
  director_name: string;
}

export interface FilmProducer {
  producer_id: number;
  producer_name: string;
}

export interface FilmWriter {
  writer_id: number;
  writer_name: string;
}

export interface FilmShowDate {
  date: string;
}

export interface FilmAlternateVersion {
  film_id: number;
  film_name: string;
  version_type: string;
}

export interface FilmDetailsStatus {
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

/**
 * Full details for one film (`GET /filmDetails/?film_id=`).
 * Base fields match the list items, except the list's `film_trailer`
 * is replaced here by `trailers` (observed `null`; item shape TBD).
 */
export interface FilmDetails {
  film_id: number;
  imdb_id: number;
  imdb_title_id: string;
  film_name: string;
  other_titles: Record<string, string> | null;
  version_type: string;
  images: FilmImages;
  synopsis_long: string;
  distributor_id: number;
  distributor: string;
  release_dates: FilmReleaseDate[];
  age_rating: FilmAgeRating[];
  duration_mins: number;
  review_stars: number;
  review_txt: string;
  trailers: unknown;
  genres: FilmGenre[];
  cast: FilmCastMember[];
  directors: FilmDirector[];
  producers: FilmProducer[];
  writers: FilmWriter[];
  show_dates: FilmShowDate[];
  alternate_versions: FilmAlternateVersion[];
  status: FilmDetailsStatus;
}

export interface FilmDetailsParams {
  film_id: number;
}

export interface CinemaDetailsStatus {
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

/**
 * Full details for one cinema (`GET /cinemaDetails/?cinema_id=`).
 * `status` travels inline. `ticketing` is a 0/1 flag (observed `0`).
 */
export interface CinemaDetails {
  cinema_id: number;
  cinema_name: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  county: string;
  country: string;
  postcode: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number;
  ticketing: number;
  directions: string;
  logo_url: string;
  show_dates: FilmShowDate[];
  status: CinemaDetailsStatus;
}

export interface CinemaDetailsParams {
  cinema_id: number;
}
