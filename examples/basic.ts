import { GluClient, nowDeviceDateTime } from "../src/index.js";

async function main() {
  const client = new GluClient({
    baseUrl: process.env.GLU_API_URL ?? "http://localhost:3000",
    headers: {
      client: process.env.GLU_CLIENT ?? "glu-app",
      "x-api-key": process.env.GLU_API_KEY ?? "",
      authorization: process.env.GLU_AUTH ?? "",
      territory: process.env.GLU_TERRITORY ?? "KH",
      "api-version": process.env.GLU_API_VERSION ?? "v1",
      geolocation: process.env.GLU_GEO ?? "",
      "device-datetime": process.env.GLU_DEVICE_DATETIME ?? nowDeviceDateTime(),
    },
  });

  const movies = await client.movies.list({ limit: 5 });
  console.log(movies);

  if (movies[0]) {
    const one = await client.movies.get(movies[0].id);
    console.log(one);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
