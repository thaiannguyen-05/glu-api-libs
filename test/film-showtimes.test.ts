import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { FilmShowTimesResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const showTimesFixture: FilmShowTimesResponse = {
  film: {
    film_id: 2756,
    imdb_id: 79501,
    imdb_title_id: "tt0079501",
    film_name: "Mad Max",
    other_titles: { EN: "Mad Max (1979)" },
    version_type: "Standard",
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
  },
  cinemas: [
    {
      cinema_id: 10636,
      cinema_name: "Cinema 6",
      address: "Jetty",
      city: "city",
      county: "county",
      state: "State",
      zip: "Zip",
      lat: -22.680721,
      lng: 14.519094,
      distance: 57.56,
      logo_url: "https://assets.movieglu.com/chain_logos/xx/UK-0-sq.jpg",
      showings: {
        Standard: {
          film_id: 2756,
          film_name: "Mad Max",
          times: [
            { start_time: "10:30", end_time: "12:33" },
            { start_time: "20:30", end_time: "22:33" },
          ],
        },
      },
    },
    {
      cinema_id: 8842,
      cinema_name: "Cinema 1",
      address: "Big Daddy",
      city: "city",
      county: "county",
      state: "State",
      zip: "Zip",
      lat: -24.768314,
      lng: 15.303885,
      distance: 208.39,
      logo_url: "https://assets.movieglu.com/chain_logos/xx/UK-1-sq.jpg",
      showings: {
        Standard: {
          film_id: 2756,
          film_name: "Mad Max",
          times: [{ start_time: "10:00", end_time: "12:03" }],
        },
        IMAX: {
          film_id: 9000002,
          film_name: "Mad Max IMAX",
          times: [{ start_time: "15:00", end_time: "17:03" }],
        },
        "IMAX 3D": {
          film_id: 9000003,
          film_name: "Mad Max IMAX 3D",
          times: [{ start_time: "12:30", end_time: "14:33" }],
        },
        "3D": {
          film_id: 9000001,
          film_name: "Mad Max 3D",
          times: [{ start_time: "10:00", end_time: "12:03" }],
        },
      },
    },
  ],
  status: {
    count: 7,
    state: "OK",
    method: "filmShowTimes",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:26:32.700Z",
    device_datetime_used: "2026-10-05 16:26:32",
  },
};

describe("films.showTimes", () => {
  it("hits /filmShowTimes/ with film_id, date and n", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(showTimesFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.films.showTimes({ film_id: 2756, date: "2026-10-12", n: 10 });
    expect(res.film.film_name).toBe("Mad Max");
    expect(res.cinemas).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/filmShowTimes/?film_id=2756&date=2026-10-12&n=10",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("n is optional; times carry end_time; alt versions keyed by format", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(showTimesFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.films.showTimes({ film_id: 2756, date: "2026-10-12" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/filmShowTimes/?film_id=2756&date=2026-10-12",
      expect.anything(),
    );
    expect(res.film.age_rating[0]?.rating).toBe("15");
    expect(res.cinemas[0]?.showings.Standard.times[0]).toEqual({
      start_time: "10:30",
      end_time: "12:33",
    });
    expect(Object.keys(res.cinemas[1]?.showings ?? {}).sort()).toEqual([
      "3D",
      "IMAX",
      "IMAX 3D",
      "Standard",
    ]);
    expect(res.cinemas[1]?.showings["IMAX 3D"].film_id).toBe(9000003);
    expect(res.status.method).toBe("filmShowTimes");
  });

  it("rejects bad params without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    // @ts-expect-error - testing runtime guard
    await expect(client.films.showTimes({})).rejects.toThrow(/film_id/);
    await expect(client.films.showTimes({ film_id: 2756, date: "12-10-2026" })).rejects.toThrow(
      /date/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
