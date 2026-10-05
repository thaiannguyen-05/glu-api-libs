import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { FilmsNowShowingResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const envelope: FilmsNowShowingResponse = {
  films: [
    {
      film_id: 7772,
      imdb_id: 82971,
      imdb_title_id: "tt0082971",
      film_name: "Raiders of the Lost Ark",
      other_titles: null,
      release_dates: [{ release_date: "1992-07-01", notes: "XXX" }],
      age_rating: [
        {
          rating: "PG ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/pg.png",
          age_advisory: "Contains moderate violence and mild language",
        },
      ],
      film_trailer: "https://trailer.movieglu.com/7772_high.mp4",
      synopsis_long: "Indy races for the Ark.",
      images: {
        poster: {
          1: {
            image_orientation: "portrait",
            region: "UK",
            medium: {
              film_image: "https://image.movieglu.com/7772/GBR_007772h0.jpg",
              width: 200,
              height: 300,
            },
          },
        },
        still: {
          1: {
            image_orientation: "landscape",
            medium: {
              film_image: "https://image.movieglu.com/7772/007772h2.jpg",
              width: 300,
              height: 200,
            },
          },
        },
      },
    },
    {
      film_id: 184126,
      imdb_id: 3659388,
      imdb_title_id: "tt3659388",
      film_name: "The Martian",
      other_titles: null,
      release_dates: [{ release_date: "2015-09-30", notes: "XXX" }],
      age_rating: [
        {
          rating: "12A ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/12a.png",
          age_advisory: "infrequent strong language, injury detail",
        },
      ],
      film_trailer: null,
      synopsis_long: "Watney survives on Mars.",
      images: {
        poster: {
          1: {
            image_orientation: "portrait",
            region: "UK",
            medium: {
              film_image: "https://image.movieglu.com/184126/GBR_184126h0.jpg",
              width: 200,
              height: 300,
            },
          },
        },
        still: {
          1: {
            image_orientation: "landscape",
            medium: {
              film_image: "https://image.movieglu.com/184126/184126h2.jpg",
              width: 300,
              height: 200,
            },
          },
        },
      },
    },
  ],
  status: {
    count: 2,
    state: "OK",
    method: "filmsNowShowing",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T15:52:16.569Z",
    device_datetime_used: "2026-10-05 15:52:16",
  },
};

function mockFetchOnce(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("films.nowShowing", () => {
  it("hits /filmsNowShowing/?n= with required headers and unwraps films", async () => {
    const fetchMock = mockFetchOnce(envelope);
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const films = await client.films.nowShowing({ n: 10 });
    expect(films).toHaveLength(2);
    expect(films[0]?.film_name).toBe("Raiders of the Lost Ark");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/filmsNowShowing/?n=10",
      expect.objectContaining({
        headers: expect.objectContaining({
          client: "test-client",
          "x-api-key": "test-api-key",
          "device-datetime": "2023-09-14T19:30:00.000",
        }),
      }),
    );
  });

  it("trims age_rating.rating and preserves null trailer", async () => {
    const fetchMock = mockFetchOnce(envelope);
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const films = await client.films.nowShowing();
    expect(films[0]?.age_rating[0]?.rating).toBe("PG");
    expect(films[1]?.age_rating[0]?.rating).toBe("12A");
    expect(films[1]?.film_trailer).toBeNull();
  });

  it("includeStatus returns films + status envelope", async () => {
    const fetchMock = mockFetchOnce(envelope);
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.films.nowShowing({ n: 2, includeStatus: true });
    expect(res.films).toHaveLength(2);
    expect(res.status?.method).toBe("filmsNowShowing");
    expect(res.status?.count).toBe(2);
  });

  it("204 maps to empty list", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    await expect(client.films.nowShowing()).resolves.toEqual([]);
  });
});
