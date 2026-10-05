import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { FilmDetails, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const detailsFixture: FilmDetails = {
  film_id: 2756,
  imdb_id: 79501,
  imdb_title_id: "tt0079501",
  film_name: "Mad Max",
  other_titles: { EN: "Mad Max (1979)" },
  version_type: "Standard",
  images: {
    poster: {
      1: {
        image_orientation: "portrait",
        region: "UK",
        medium: {
          film_image: "https://image.movieglu.com/2756/GBR_002756h0.jpg",
          width: 200,
          height: 300,
        },
      },
      2: {
        image_orientation: "portrait",
        region: "global",
        medium: {
          film_image: "https://image.movieglu.com/2756/002756h1.jpg",
          width: 200,
          height: 300,
        },
      },
    },
    still: {
      1: {
        image_orientation: "portrait",
        medium: {
          film_image: "https://image.movieglu.com/0/0h2.jpg",
          width: 200,
          height: 300,
        },
      },
    },
  },
  synopsis_long: "A police officer realizes his life is in danger.",
  distributor_id: 81,
  distributor: "Warner Bros. UK",
  release_dates: [{ release_date: "2026-10-12", notes: "XXX" }],
  age_rating: [
    {
      rating: "15 ",
      age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/15.png",
      age_advisory: "strong threat, violence, injury detail",
    },
  ],
  duration_mins: 91,
  review_stars: 0,
  review_txt: "",
  trailers: null,
  genres: [
    { genre_id: 1, genre_name: "Drama" },
    { genre_id: 5, genre_name: "Action/Adventure" },
    { genre_id: 10, genre_name: "SciFi/Fantasy" },
  ],
  cast: [
    { cast_id: 2475, cast_name: "Mel Gibson" },
    { cast_id: 2476, cast_name: "Joanne Samuel" },
  ],
  directors: [{ director_id: 591, director_name: "George Miller" }],
  producers: [{ producer_id: 330, producer_name: "Byron Kennedy" }],
  writers: [
    { writer_id: 93, writer_name: "George Miller" },
    { writer_id: 712, writer_name: "James McCausland" },
  ],
  show_dates: [{ date: "2026-10-12" }, { date: "2026-10-13" }],
  alternate_versions: [
    { film_id: 9000001, film_name: "Mad Max 3D", version_type: "3D" },
    { film_id: 9000002, film_name: "Mad Max IMAX", version_type: "IMAX" },
    { film_id: 9000003, film_name: "Mad Max IMAX 3D", version_type: "IMAX 3D" },
  ],
  status: {
    count: 1,
    state: "OK",
    method: "filmDetails",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:16:06.336Z",
    device_datetime_used: "2026-10-05 16:16:06",
  },
};

describe("films.details", () => {
  it("hits /filmDetails/?film_id= and returns the full film", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(detailsFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const film = await client.films.details({ film_id: 2756 });
    expect(film.film_name).toBe("Mad Max");
    expect(film.version_type).toBe("Standard");
    expect(film.distributor).toBe("Warner Bros. UK");
    expect(film.duration_mins).toBe(91);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/filmDetails/?film_id=2756",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("parses credits, genres, show dates and alternate versions", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(detailsFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const film = await client.films.details({ film_id: 2756 });
    expect(film.genres.map((g) => g.genre_name)).toEqual([
      "Drama",
      "Action/Adventure",
      "SciFi/Fantasy",
    ]);
    expect(film.cast[0]).toEqual({ cast_id: 2475, cast_name: "Mel Gibson" });
    expect(film.directors).toEqual([{ director_id: 591, director_name: "George Miller" }]);
    expect(film.show_dates).toHaveLength(2);
    expect(film.alternate_versions).toHaveLength(3);
    expect(film.status.method).toBe("filmDetails");
  });

  it("trims age_rating.rating and keeps multiple posters", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(detailsFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const film = await client.films.details({ film_id: 2756 });
    expect(film.age_rating[0]?.rating).toBe("15");
    expect(Object.keys(film.images.poster)).toEqual(["1", "2"]);
  });

  it("rejects missing or non-integer film_id without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    // @ts-expect-error - testing runtime guard
    await expect(client.films.details({})).rejects.toThrow(/film_id/);
    // @ts-expect-error - testing runtime guard
    await expect(client.films.details({ film_id: "2756" })).rejects.toThrow(/film_id/);
    await expect(client.films.details({ film_id: 27.56 })).rejects.toThrow(/film_id/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
