import { assertRequiredHeaders, createHttpClient } from "./http.js";
import { MoviesResource } from "./resources/movies.js";
import type { GluClientOptions } from "./types.js";

export class GluClient {
  readonly movies: MoviesResource;

  constructor(options: GluClientOptions) {
    if (!options.baseUrl) throw new Error("GluClient requires baseUrl");
    if (!options.headers) throw new Error("GluClient requires headers");
    assertRequiredHeaders(options.headers);
    const http = createHttpClient(options);
    this.movies = new MoviesResource(http);
  }
}
