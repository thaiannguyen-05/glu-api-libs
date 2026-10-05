import { assertRequiredHeaders, createHttpClient } from "./http.js";
import { FilmsResource } from "./resources/films.js";
import type { GluClientOptions } from "./types.js";

export class GluClient {
  readonly films: FilmsResource;

  constructor(options: GluClientOptions) {
    if (!options.baseUrl) throw new Error("GluClient requires baseUrl");
    if (!options.headers) throw new Error("GluClient requires headers");
    assertRequiredHeaders(options.headers);
    const http = createHttpClient(options);
    this.films = new FilmsResource(http);
  }
}
