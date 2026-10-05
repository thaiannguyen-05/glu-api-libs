import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { CinemaShowTimesResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const showTimesFixture: CinemaShowTimesResponse = {
  cinema: {
    cinema_id: 8845,
    cinema_name: "Cinema 2",
    address: "Deadvlei",
    address2: "address2",
    city: "city",
    country: "country",
    state: "State",
    postcode: "Zip",
    returned_date: "2026-10-12",
    show_dates: [
      { date: "2026-10-05", display_date: "Mon 5 Oct" },
      { date: "2026-10-12", display_date: "Mon 12 Oct" },
    ],
  },
  films: [
    {
      film_id: 7772,
      imdb_id: 82971,
      imdb_title_id: "tt0082971",
      film_name: "Raiders of the Lost Ark",
      other_titles: null,
      version_type: "Standard",
      synopsis_long: "Indy races for the Ark.",
      duration_mins: 105,
      duration_hrs_mins: "1h 45m",
      genres: [{ genre_id: 5, genre_name: "Action/Adventure" }],
      age_rating: [
        {
          rating: "PG ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/pg.png",
          age_advisory: "Contains moderate violence and mild language",
        },
      ],
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
      showings: {
        Standard: {
          film_id: 7772,
          film_name: "Raiders of the Lost Ark",
          times: [
            { start_time: "12:40", display_start_time: "12:40 PM" },
            { start_time: "20:40", display_start_time: "8:40 PM" },
          ],
        },
      },
    },
    {
      film_id: 2756,
      imdb_id: 79501,
      imdb_title_id: "tt0079501",
      film_name: "Mad Max",
      other_titles: { EN: "Mad Max (1979)" },
      version_type: "Standard",
      synopsis_long: "A police officer realizes his life is in danger.",
      duration_mins: 91,
      duration_hrs_mins: "1h 31m",
      genres: [{ genre_id: 1, genre_name: "Drama" }],
      age_rating: [
        {
          rating: "15 ",
          age_rating_image: "https://assets.movieglu.com/age_rating_logos/xx/15.png",
          age_advisory: "strong threat, violence, injury detail",
        },
      ],
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
      showings: {
        Standard: {
          film_id: 2756,
          film_name: "Mad Max",
          times: [{ start_time: "10:00", display_start_time: "10:00 AM" }],
        },
      },
    },
  ],
  status: {
    count: 2,
    state: "OK",
    method: "cinemaShowTimes",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:24:38.576Z",
    device_datetime_used: "2026-10-05 16:24:38",
  },
};

describe("cinemas.showTimes", () => {
  it("hits /cinemaShowTimes/ with all query params", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(showTimesFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.cinemas.showTimes({
      film_id: 2756,
      cinema_id: 8845,
      date: "2026-10-12",
      sort: "popularity",
    });
    expect(res.cinema.cinema_name).toBe("Cinema 2");
    expect(res.cinema.returned_date).toBe("2026-10-12");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemaShowTimes/?film_id=2756&cinema_id=8845&date=2026-10-12&sort=popularity",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("sort is optional and ratings are trimmed", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(showTimesFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.cinemas.showTimes({
      film_id: 2756,
      cinema_id: 8845,
      date: "2026-10-12",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemaShowTimes/?film_id=2756&cinema_id=8845&date=2026-10-12",
      expect.anything(),
    );
    expect(res.films.map((f) => f.age_rating[0]?.rating)).toEqual(["PG", "15"]);
    expect(res.films[0]?.showings.Standard.times).toHaveLength(2);
    expect(res.status.method).toBe("cinemaShowTimes");
  });

  it("rejects bad params without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    // @ts-expect-error - testing runtime guard
    await expect(client.cinemas.showTimes({})).rejects.toThrow(/film_id/);
    await expect(
      client.cinemas.showTimes({ film_id: 2756, cinema_id: 8845, date: "12-10-2026" }),
    ).rejects.toThrow(/date/);
    await expect(
      client.cinemas.showTimes({ film_id: 2756, cinema_id: 88.5, date: "2026-10-12" }),
    ).rejects.toThrow(/cinema_id/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
