import { GluClient, nowDeviceDateTime } from "../src/index.js";

async function main() {
  const client = new GluClient({
    baseUrl: process.env.GLU_API_URL ?? "https://api-gate2.movieglu.com",
    headers: {
      client: process.env.GLU_CLIENT ?? "glu-app",
      "x-api-key": process.env.GLU_API_KEY ?? "",
      authorization: process.env.GLU_AUTH ?? "",
      territory: process.env.GLU_TERRITORY ?? "UK",
      "api-version": process.env.GLU_API_VERSION ?? "v201",
      geolocation: process.env.GLU_GEO ?? "",
      "device-datetime": process.env.GLU_DEVICE_DATETIME ?? nowDeviceDateTime(),
    },
  });

  const films = await client.films.nowShowing({ n: 10 });
  console.log(films.map((f) => `${f.film_id} ${f.film_name}`));

  const withStatus = await client.films.nowShowing({ n: 10, includeStatus: true });
  console.log(withStatus.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
