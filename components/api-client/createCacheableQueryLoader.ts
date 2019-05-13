import DataLoader from "dataloader";
import Kitsu, { GetParams, KitsuResponse } from "kitsu";

/** The params required for an API GET request. */
interface QueryKey {
  path: string;
  params: GetParams;
}

export type QueryLoader = (
  path: string,
  params: GetParams
) => Promise<KitsuResponse<any>>;

/**
 * Returns a GET method that works like the API client's get method, but API requests and
 * their responses are cached, so multiple duplicate API requests will only send 1 HTTP request.
 */
export function createCacheableQueryLoader(apiClient: Kitsu): QueryLoader {
  const queryLoader = new DataLoader<QueryKey, KitsuResponse<any>>(
    keys => {
      const promises = keys.map(({ path, params }) =>
        apiClient.get(path, params)
      );

      return Promise.all(promises);
    },
    { cacheKeyFn: JSON.stringify }
  );

  // Return the cacheable GET function.
  return function get(path: string, params: GetParams) {
    return queryLoader.load({ path, params });
  };
}
