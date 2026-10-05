import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type {
  FilmsComingSoonResponse,
  FilmsNowShowingResponse,
  GluClientHeaders,
} from "../src/index.js";

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

const comingSoonEnvelope: FilmsComingSoonResponse = {
  films: [
    {
      film_id: 2756,
      imdb_id: 79501,
      imdb_title_id: "tt0079501",
      film_name: "Mad Max",
      other_titles: { EN: "Mad Max (1979)" },
      release_dates: [{ release_date: "2026-10-12", notes: "XXX" }],
      age_rating: [
        {
          rating: "15 ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/15.png",
          age_advisory: "strong threat, violence, injury detail",
        },
      ],
      film_trailer: null,
      synopsis_long: "A police officer realizes his life is in danger.",
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
    },
    {
      film_id: 4167,
      imdb_id: 58625,
      imdb_title_id: "tt0058625",
      film_name: "Woman in the Dunes",
      other_titles: null,
      release_dates: [{ release_date: "2026-10-06", notes: "XXX" }],
      age_rating: [
        {
          rating: "15 ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/15.png",
          age_advisory: "Contains moderate sex and sexual assault",
        },
      ],
      film_trailer: null,
      synopsis_long: "An entomologist trapped in the dunes.",
      images: {
        poster: {
          1: {
            image_orientation: "portrait",
            region: "global",
            medium: {
              film_image: "https://image.movieglu.com/0/0h1.jpg",
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
    },
  ],
  status: {
    count: 2,
    state: "OK",
    method: "filmsComingSoon",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:11:12.724Z",
    device_datetime_used: "2026-10-05 16:11:12",
  },
};

function mockFetchOnce(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

function makeClient(fetchMock: ReturnType<typeof mockFetchOnce>) {
  return new GluClient({
    baseUrl: "https://api.example.com",
    headers,
    fetch: fetchMock,
  });
}

describe("films.nowShowing", () => {
  it("hits /filmsNowShowing/?n= with required headers and unwraps films", async () => {
    const fetchMock = mockFetchOnce(envelope);
    const client = makeClient(fetchMock);
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
    const client = makeClient(fetchMock);
    const films = await client.films.nowShowing();
    expect(films[0]?.age_rating[0]?.rating).toBe("PG");
    expect(films[1]?.age_rating[0]?.rating).toBe("12A");
    expect(films[1]?.film_trailer).toBeNull();
  });

  it("includeStatus returns films + status envelope", async () => {
    const fetchMock = mockFetchOnce(envelope);
    const client = makeClient(fetchMock);
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

describe("films.comingSoon", () => {
  it("hits /filmsComingSoon/?n= and unwraps films", async () => {
    const fetchMock = mockFetchOnce(comingSoonEnvelope);
    const client = makeClient(fetchMock);
    const films = await client.films.comingSoon({ n: 10 });
    expect(films).toHaveLength(2);
    expect(films[0]?.film_name).toBe("Mad Max");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/filmsComingSoon/?n=10",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("keeps other_titles object, trims rating, preserves null trailer", async () => {
    const fetchMock = mockFetchOnce(comingSoonEnvelope);
    const client = makeClient(fetchMock);
    const films = await client.films.comingSoon();
    expect(films[0]?.other_titles).toEqual({ EN: "Mad Max (1979)" });
    expect(films[1]?.other_titles).toBeNull();
    expect(films[0]?.age_rating[0]?.rating).toBe("15");
    expect(films[0]?.film_trailer).toBeNull();
  });

  it("includeStatus returns films + filmsComingSoon status", async () => {
    const fetchMock = mockFetchOnce(comingSoonEnvelope);
    const client = makeClient(fetchMock);
    const res = await client.films.comingSoon({ n: 2, includeStatus: true });
    expect(res.films).toHaveLength(2);
    expect(res.status?.method).toBe("filmsComingSoon");
    expect(res.status?.count).toBe(2);
  });

  it("204 maps to empty list", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    await expect(client.films.comingSoon()).resolves.toEqual([]);
  });
});
