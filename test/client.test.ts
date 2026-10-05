import { describe, expect, it, vi } from "vitest";
import {
  formatDeviceDateTime,
  GluClient,
  isDeviceDateTime,
  nowDeviceDateTime,
} from "../src/index.js";
import type { GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

function mockFetchOnce(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("GluClient", () => {
  it("requires baseUrl", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => new GluClient({ headers })).toThrow(/baseUrl/);
  });

  it("requires all headers", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => new GluClient({ baseUrl: "https://api.example.com" })).toThrow(/headers/);
    expect(
      () =>
        new GluClient({
          baseUrl: "https://api.example.com",
          headers: { ...headers, "x-api-key": "" },
        }),
    ).toThrow(/x-api-key/);
  });

  it("rejects bad device-datetime", () => {
    for (const bad of [
      "2023-09-14T19:30:00.000Z",
      "2023-09-14T19:30:00+07:00",
      "2023-09-14 19:30:00",
      "2023-09-14",
      "19:30:00",
      "",
      "2023-02-30T10:00:00.000",
    ]) {
      expect(
        () =>
          new GluClient({
            baseUrl: "https://api.example.com",
            headers: { ...headers, "device-datetime": bad },
          }),
      ).toThrow(/device-datetime/);
    }
  });

  it("accepts device-datetime with and without millis", () => {
    expect(isDeviceDateTime("2023-09-14T19:30:00.000")).toBe(true);
    expect(isDeviceDateTime("2023-09-14T19:30:00")).toBe(true);
    expect(isDeviceDateTime(nowDeviceDateTime())).toBe(true);
    expect(formatDeviceDateTime(new Date(2023, 8, 14, 19, 30, 0, 0))).toBe(
      "2023-09-14T19:30:00.000",
    );
  });

  it("movies.list hits /movies with required headers", async () => {
    const fetchMock = mockFetchOnce([{ id: "1", title: "Dune" }]);
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const movies = await client.movies.list();
    expect(movies).toEqual([{ id: "1", title: "Dune" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/movies",
      expect.objectContaining({
        headers: expect.objectContaining({
          client: "test-client",
          "x-api-key": "test-api-key",
          authorization: "Bearer test-token",
          territory: "KH",
          "api-version": "v1",
          geolocation: "11.55,104.91",
          "device-datetime": "2023-09-14T19:30:00.000",
        }),
      }),
    );
  });

  it("movies.get hits /movies/:id", async () => {
    const fetchMock = mockFetchOnce({ id: "1", title: "Dune" });
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const movie = await client.movies.get("1");
    expect(movie.title).toBe("Dune");
  });
});
