import { useFetch, useRefetch, useDataRefId } from '@microsoft/overreact';
import { useCallback, useMemo } from 'react';

import { cruiseFetchSpec, cruiseRefetchSpec } from './cruise-spec';

export function useCruise(dataLocator, config = {}) {
  const dataRefId = useDataRefId(null);

  const defaultConfig = useMemo(() => ({
    mutation: config.mutation ? config.mutation : {},
    fetch: config.fetch ? config.fetch : {},
    refetch: config.refetch ? config.refetch : {},
  }), [config]);

  const fetchResult = useFetch(dataRefId, cruiseFetchSpec, dataLocator, defaultConfig.fetch);
  const refetchResult = useRefetch(
    dataRefId, cruiseRefetchSpec, defaultConfig.refetch,
  );

  const refetch = useCallback((param, requestConfig, ...rest) => {
    refetchResult({
      variables: { ...dataLocator, ...param.variables },
      payload: { ...param.body },
    }, requestConfig, ...rest);
  }, [dataLocator, refetchResult]);

  const [data, error] = fetchResult;

  return [{ data, error }, { refetch }];
}
