const { useCallback, useMemo } = require('react');
const { useDataRefId, usePagination, useMutation } = require('@microsoft/overreact');

const { useSpecs } = require('./use-specs');

function useODataCollection(specs, path, variables, config) {
  const dataRefId = useDataRefId();
  const { collSpecs } = useSpecs(specs, path);

  const {
    fetch: fetchSpec,
    mutation: mutationSpec,
    destroy: destroySpec,
    add: addSpec,
  } = collSpecs;

  // FIXME: extract fetchVariables out from the config
  const paginationConfig = useMemo(() => ({
    fetchVariables: {
      ...variables,
    },
    ...config,
  }), [config, variables]);

  const [data, methods] = usePagination(dataRefId, fetchSpec, paginationConfig);

  const mutateFn = useMutation(dataRefId, mutationSpec, config);
  const destroyFn = useMutation(dataRefId, destroySpec, config);
  const createFn = useMutation(dataRefId, addSpec, config);

  const update = useCallback((newData, ...rest) => {
    mutateFn(variables, newData, ...rest);
  }, [mutateFn, variables]);

  // FIXME: likezh: Why would destroy need data?
  const destroy = useCallback((newData, ...rest) => {
    destroyFn(variables, newData, ...rest);
  }, [destroyFn, variables]);

  const create = useCallback((newData, ...rest) => {
    createFn(variables, newData, ...rest);
  }, [createFn, variables]);

  const { loadMore, hasMore, isLoading } = methods;

  return [data, {
    loadMore,
    hasMore,
    isLoading,
    create,
    update,
    destroy,
  }];
}

module.exports = {
  useODataCollection,
};
