import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { CinemasNearbyResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const nearbyFixture: CinemasNearbyResponse = {
  cinemas: [
    {
      cinema_id: 10636,
      cinema_name: "Cinema 6",
      address: "Jetty",
      address2: "address2",
      city: "city",
      state: "State",
      county: "county",
      postcode: "Zip",
      lat: -22.680721,
      lng: 14.519094,
      distance: 57.55892076987,
      logo_url: "https://assets.movieglu.com/chain_logos/xx/UK-0-sq.jpg",
    },
    {
      cinema_id: 8845,
      cinema_name: "Cinema 2",
      address: "Deadvlei",
      address2: "address2",
      city: "city",
      state: "State",
      county: "county",
      postcode: "Zip",
      lat: -24.759233,
      lng: 15.292389,
      distance: 207.52516109344,
      logo_url: "https://assets.movieglu.com/chain_logos/xx/UK-1-sq.jpg",
    },
  ],
  status: {
    count: 2,
    state: "OK",
    method: "cinemasNearby",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:18:07.802Z",
    device_datetime_used: "2026-10-05 16:18:07",
  },
};

describe("cinemas.nearby", () => {
  it("hits /cinemasNearby/?n= and unwraps cinemas in distance order", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(nearbyFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const cinemas = await client.cinemas.nearby({ n: 5 });
    expect(cinemas).toHaveLength(2);
    expect(cinemas[0]?.cinema_name).toBe("Cinema 6");
    expect(cinemas[0]?.distance).toBeLessThan(cinemas[1]?.distance ?? 0);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemasNearby/?n=5",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("includeStatus returns cinemas + cinemasNearby status", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(nearbyFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const res = await client.cinemas.nearby({ n: 5, includeStatus: true });
    expect(res.cinemas).toHaveLength(2);
    expect(res.status?.method).toBe("cinemasNearby");
  });

  it("204 maps to empty list", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    await expect(client.cinemas.nearby()).resolves.toEqual([]);
  });
});
