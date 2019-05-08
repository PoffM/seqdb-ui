import Kitsu from "kitsu";
import { createCacheableQueryLoader } from "../createCacheableQueryLoader";

/** Mock Kitsu "get" method. */
const mockGet = jest.fn(async (_, {}) => {
  return [];
});

// Mock Kitsu, the client class that talks to the backend.
jest.mock(
  "kitsu",
  () =>
    class {
      public get = mockGet;
    }
);

describe("createCacheableQueryLoader function", () => {
  it("Provides a function to re-use responses for duplicate HTTP requests.", async () => {
    const apiClient = new Kitsu({
      baseURL: "/api",
      pluralize: false,
      resourceCase: "none"
    });

    const cacheableGet = createCacheableQueryLoader(apiClient);

    await Promise.all([
      // 3 of the same request
      cacheableGet("pcrPrimer", { filter: { name: "name==101F" } }),
      cacheableGet("pcrPrimer", { filter: { name: "name==101F" } }),
      cacheableGet("pcrPrimer", { filter: { name: "name==101F" } }),
      // A second unique request
      cacheableGet("region", { filter: { name: "name==101F" } })
    ]);

    // Expect only the two unique requests.
    expect(mockGet.mock.calls).toEqual([
      ["pcrPrimer", { filter: { name: "name==101F" } }],
      ["region", { filter: { name: "name==101F" } }]
    ]);
  });
});
