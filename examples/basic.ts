import { GluClient } from "../src/index.js";

async function main() {
  const client = new GluClient({
    baseUrl: process.env.GLU_API_URL ?? "http://localhost:3000",
    apiKey: process.env.GLU_API_KEY,
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
