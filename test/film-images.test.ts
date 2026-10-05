import { describe, expect, it, vi } from "vitest";
import { GluClient } from "../src/index.js";
import type { FilmImagesResponse, GluClientHeaders } from "../src/index.js";

const headers: GluClientHeaders = {
  client: "test-client",
  "x-api-key": "test-api-key",
  authorization: "Bearer test-token",
  territory: "KH",
  "api-version": "v1",
  geolocation: "11.55,104.91",
  "device-datetime": "2023-09-14T19:30:00.000",
};

const imagesFixture: FilmImagesResponse = {
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
    2: {
      image_orientation: "portrait",
      region: "global",
      medium: {
        film_image: "https://image.movieglu.com/184126/184126h1.jpg",
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
    2: {
      image_orientation: "landscape",
      medium: {
        film_image: "https://image.movieglu.com/184126/184126h3.jpg",
        width: 300,
        height: 200,
      },
    },
  },
  status: {
    count: 4,
    state: "OK",
    method: "images",
    message: null,
    request_method: "GET",
    version: "ANDE_0_XXv201",
    territory: "XX",
    device_datetime_sent: "2026-10-05T16:30:04.688Z",
    device_datetime_used: "2026-10-05 16:30:04",
  },
};

describe("films.images", () => {
  it("hits /images/?film_id= and returns poster + still maps", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(imagesFixture), { status: 200 }),
    );
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    const images = await client.films.images({ film_id: 184126 });
    expect(Object.keys(images.poster)).toEqual(["1", "2"]);
    expect(images.poster[1]?.region).toBe("UK");
    expect(images.poster[2]?.region).toBe("global");
    expect(Object.keys(images.still)).toHaveLength(2);
    expect(images.status.method).toBe("images");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/images/?film_id=184126",
      expect.objectContaining({
        headers: expect.objectContaining({ client: "test-client" }),
      }),
    );
  });

  it("rejects missing or non-integer film_id without calling fetch", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const client = new GluClient({
      baseUrl: "https://api.example.com",
      headers,
      fetch: fetchMock,
    });
    // @ts-expect-error - testing runtime guard
    await expect(client.films.images({})).rejects.toThrow(/film_id/);
    await expect(client.films.images({ film_id: 1.5 })).rejects.toThrow(/film_id/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
