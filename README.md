# @glu/movie-sdk

TypeScript SDK for `glu-movie-api`. Works in Node 20+, browsers, and edge runtimes (uses native `fetch`, zero runtime deps).

## Install

```sh
pnpm add @glu/movie-sdk
# npm i @glu/movie-sdk
```

## Use

```ts
import { GluClient } from "@glu/movie-sdk";

const client = new GluClient({
  baseUrl: "https://api.example.com",
  apiKey: process.env.GLU_API_KEY, // optional, sent as Bearer
});

const movies = await client.movies.list({ query: "dune", limit: 10 });
const one = await client.movies.get(movies[0].id);
```

## Scripts

- `pnpm build` — build ESM+CJS + `.d.ts` via tsup
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — vitest
- `pnpm lint` / `pnpm format` — eslint / prettier

## Layout

```
src/
  index.ts        # public exports
  client.ts       # GluClient entry
  types.ts        # GluClientOptions, Movie
  errors.ts       # ApiError
  http.ts         # fetch wrapper (timeout, auth, JSON)
  resources/
    movies.ts     # movies.list / movies.get
test/
examples/
```
