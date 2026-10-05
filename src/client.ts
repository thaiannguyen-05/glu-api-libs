import { createHttpClient } from "./http.js";
import { MoviesResource } from "./resources/movies.js";
import type { GluClientOptions } from "./types.js";

export class GluClient {
  readonly movies: MoviesResource;

  constructor(options: GluClientOptions) {
    if (!options.baseUrl) throw new Error("GluClient requires baseUrl");
    const http = createHttpClient(options);
    this.movies = new MoviesResource(http);
  }
}
