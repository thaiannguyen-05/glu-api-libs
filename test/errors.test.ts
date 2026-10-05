import { describe, expect, it, vi } from "vitest";
import { ApiError, GluClient } from "../src/index.js";
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

function clientWithFetch(fetchMock: typeof fetch) {
  return new GluClient({ baseUrl: "https://api.example.com", headers, fetch: fetchMock });
}

describe("API error handling", () => {
  it("204 returns undefined (no content)", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    await expect(client.movies.list()).resolves.toBeUndefined();
  });

  it("400 maps to bad_request with MG-message", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({}), {
          status: 400,
          headers: { "MG-message": "Invalid query parameter: foo" },
        }),
    );
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe("bad_request");
    expect(err.mgMessage).toBe("Invalid query parameter: foo");
    expect(err.message).toBe("Invalid query parameter: foo");
  });

  it("401 maps to unauthorized", async () => {
    const fetchMock = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.code).toBe("unauthorized");
  });

  it("403 maps to forbidden", async () => {
    const fetchMock = vi.fn(async () => new Response("forbidden", { status: 403 }));
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(403);
    expect(err.code).toBe("forbidden");
    expect(err.message).toMatch(/base URL/i);
  });

  it("429 maps to rate_limited", async () => {
    const fetchMock = vi.fn(async () => new Response("slow down", { status: 429 }));
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(429);
    expect(err.code).toBe("rate_limited");
  });

  it("504 maps to gateway_timeout", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 504 }));
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(504);
    expect(err.code).toBe("gateway_timeout");
  });

  it("body message takes priority over MG-message and defaults", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Custom body error", code: "custom" }), {
          status: 400,
          headers: { "MG-message": "Header error" },
        }),
    );
    const client = clientWithFetch(fetchMock as unknown as typeof fetch);
    const err = await client.movies.list().catch((e) => e);
    expect(err.message).toBe("Custom body error");
    expect(err.code).toBe("custom");
    expect(err.mgMessage).toBe("Header error");
  });
});
