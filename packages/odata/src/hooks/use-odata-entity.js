import { useCallback } from 'react';

import { useDataRefId, useFetch, useMutation } from '@microsoft/overreact';
import { useSpecs } from './shared';

export function useODataEntity(specs, path, variables, config = {}) {
  const dataRefId = useDataRefId();
  const { entitySpecs } = useSpecs(specs, path);

  const {
    fetch: fetchSpec,
    mutation: mutationSpec,
    destroy: destroySpec,
  } = entitySpecs;

  const [data, error] = useFetch(dataRefId, fetchSpec, variables, config);
  const mutateFn = useMutation(dataRefId, mutationSpec, config);
  const destroyFn = useMutation(dataRefId, destroySpec, config);

  const update = useCallback((newData, ...rest) => {
    mutateFn(variables, newData, ...rest);
  }, [mutateFn, variables]);

  // FIXME: likezh: Why would destroy need data?
  const destroy = useCallback((newData, ...rest) => {
    destroyFn(variables, newData, ...rest);
  }, [destroyFn, variables]);

  return [{ data, error }, { update, destroy }];
}
