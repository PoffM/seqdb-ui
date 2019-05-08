import DataLoader from "dataloader";
import Kitsu, { GetParams, KitsuResponse } from "kitsu";

interface QueryKey {
  path: string;
  params: GetParams;
}

export type QueryLoader = (
  path: string,
  params: GetParams
) => Promise<KitsuResponse<any>>;

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

  return function get(path: string, params: GetParams) {
    return queryLoader.load({ path, params });
  };
}
