# @ticket-order-system/movie-sdk

TypeScript SDK for `glu-movie-api` (MovieGlu). Works in Node 20+, browsers, and edge runtimes (uses native `fetch`, zero runtime deps).

## Install

```sh
pnpm add @ticket-order-system/movie-sdk
# npm i @ticket-order-system/movie-sdk
```

## Use

```ts
import { GluClient, nowDeviceDateTime } from "@ticket-order-system/movie-sdk";

const client = new GluClient({
  baseUrl: "https://api-gate2.movieglu.com",
  headers: {
    client: "glu-app",
    "x-api-key": process.env.GLU_API_KEY!,
    authorization: "...",
    territory: "UK",
    "api-version": "v201",
    geolocation: "51.5,-0.12",
    "device-datetime": nowDeviceDateTime(),
  },
});

const nowShowing = await client.films.nowShowing({ n: 10 });
const comingSoon = await client.films.comingSoon({ n: 10 });
const withStatus = await client.films.nowShowing({ n: 10, includeStatus: true });
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
  types.ts        # GluClientOptions, FilmNowShowing
  errors.ts       # ApiError (+ MG-message mapping)
  http.ts         # fetch wrapper (timeout, headers, JSON)
  device-datetime.ts # device-datetime helper
  resources/
    films.ts      # films.nowShowing() / films.comingSoon()
test/
examples/
```
