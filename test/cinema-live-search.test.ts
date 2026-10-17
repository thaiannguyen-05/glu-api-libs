import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { CinemaLiveSearchResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "UK",
  "api-version": "v1",
  geolocation: "51.51,-0.13",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const liveSearchFixture: CinemaLiveSearchResponse = {
  cinemas: [
    {
      cinema_id: 10195,
      cinema_name: "Reading Film Theatre",
      address: "Palmer Building",
      city: "Reading",
      postcode: "RG6 2AH",
      logo_url: "https://d2z9fe5yu2p0av.cloudfront.net/chainlogos/uk/UK-1221-sq.jpg",
    },
    {
      cinema_id: 8941,
      cinema_name: "Vue Cinemas - Reading",
      address: "Riverside Level, The Oracle Shopping Centre",
      city: "Reading",
      postcode: "RG1 2AG",
      lat: 51.45,
      lng: -0.97,
      distance: 12.5,
      logo_url: "https://d2z9fe5yu2p0av.cloudfront.net/chainlogos/uk/UK-712-sq.jpg",
    },
  ],
  status: {
    count: 2,
    state: "OK",
    method: "cinemaLiveSearch",
    message: null,
    request_method: "GET",
    version: "MGv200",
    territory: "UK",
    device_datetime_sent: "2018-09-14T13:24:40.718Z",
    device_datetime_used: "2018-09-14 13:24:40",
  },
};

describe("cinemas.liveSearch", () => {
  it("hits /cinemaLiveSearch/ with query + n and unwraps cinemas", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(liveSearchFixture), { status: 200 }),
    );
    const client = new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
    const cinemas = await client.cinemas.liveSearch({ query: "reading", n: 5 });
    expect(cinemas).toHaveLength(2);
    expect(cinemas[0]?.cinema_name).toBe("Reading Film Theatre");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemaLiveSearch/?query=reading&n=5",
      expect.objectContaining({ headers: expect.objectContaining({ client: "test-client" }) }),
    );
  });

  it("trims + URL-encodes query, n is optional", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(liveSearchFixture), { status: 200 }),
    );
    const client = new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
    await client.cinemas.liveSearch({ query: "  odeon cinemas  " });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/cinemaLiveSearch/?query=odeon+cinemas",
      expect.anything(),
    );
  });

  it("includeStatus returns cinemas + status", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(liveSearchFixture), { status: 200 }),
    );
    const client = new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
    const res = await client.cinemas.liveSearch({ query: "reading", includeStatus: true });
    expect(res.cinemas).toHaveLength(2);
    expect(res.status?.method).toBe("cinemaLiveSearch");
  });

  it("rejects short query and bad n without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
    // @ts-expect-error - testing runtime guard
    await expect(client.cinemas.liveSearch({})).rejects.toThrow(/query/);
    await expect(client.cinemas.liveSearch({ query: "ab" })).rejects.toThrow(/query/);
    await expect(client.cinemas.liveSearch({ query: "   " })).rejects.toThrow(/query/);
    await expect(client.cinemas.liveSearch({ query: "odeon", n: 0 })).rejects.toThrow(/n/);
    await expect(client.cinemas.liveSearch({ query: "odeon", n: 26 })).rejects.toThrow(/n/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("204 maps to empty list", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
    await expect(client.cinemas.liveSearch({ query: "odeon" })).resolves.toEqual([]);
  });
});
