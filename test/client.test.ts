import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";

function mockFetchOnce(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("GluClient", () => {
  it("requires baseUrl", () => {
    // @ts-expect-error - testing runtime guard
    expect(() => new GluClient({})).toThrow(/baseUrl/);
  });

  it("movies.list hits /movies", async () => {
    const fetchMock = mockFetchOnce([{ id: "1", title: "Dune" }]);
    const client = new GluClient({ baseUrl: "https://api.example.com", fetch: fetchMock });
    const movies = await client.movies.list();
    expect(movies).toEqual([{ id: "1", title: "Dune" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/movies",
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it("movies.get hits /movies/:id", async () => {
    const fetchMock = mockFetchOnce({ id: "1", title: "Dune" });
    const client = new GluClient({ baseUrl: "https://api.example.com", fetch: fetchMock });
    const movie = await client.movies.get("1");
    expect(movie.title).toBe("Dune");
  });
});
