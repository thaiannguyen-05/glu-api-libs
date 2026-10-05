import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { CinemaDetails, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const detailsFixture: CinemaDetails = {
  cinema_id: 10636,
  cinema_name: "Cinema 6",
  address: "Jetty",
  address2: "address2",
  city: "city",
  state: "State",
  county: "county",
  country: "country",
  postcode: "Zip",
  phone: "(01234) 567 8910",
  lat: -22.680721,
  lng: 14.519094,
  distance: 57.55892076987,
  ticketing: 0,
  directions: "directions",
  logo_url: "https://assets.movieglu.com/chain_logos/xx/UK-0-sq.jpg",
  show_dates: [{ date: "2026-10-05" }, { date: "2026-10-06" }],
  status: {
    count: 1,
    state: "OK",
    method: "cinemaDetails",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:18:15.337Z",
    device_datetime_used: "2026-10-05 16:18:15",
  },
};

describe("cinemas.details", () => {
  it("hits /cinemaDetails/?cinema_id= and returns the cinema", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(detailsFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const cinema = await client.cinemas.details({ cinema_id: 10636 });
    expect(cinema.cinema_name).toBe("Cinema 6");
    expect(cinema.lat).toBeCloseTo(-22.680721);
    expect(cinema.lng).toBeCloseTo(14.519094);
    expect(cinema.ticketing).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemaDetails/?cinema_id=10636",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("parses address, show dates and inline status", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(detailsFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const cinema = await client.cinemas.details({ cinema_id: 10636 });
    expect([cinema.address, cinema.city, cinema.postcode]).toEqual(["Jetty", "city", "Zip"]);
    expect(cinema.show_dates).toHaveLength(2);
    expect(cinema.status.method).toBe("cinemaDetails");
  });

  it("rejects missing or non-integer cinema_id without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    // @ts-expect-error - testing runtime guard
    await expect(client.cinemas.details({})).rejects.toThrow(/cinema_id/);
    // @ts-expect-error - testing runtime guard
    await expect(client.cinemas.details({ cinema_id: "10636" })).rejects.toThrow(/cinema_id/);
    await expect(client.cinemas.details({ cinema_id: 10.5 })).rejects.toThrow(/cinema_id/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
