const {
  useFetch,
  useDataRefId,
} = require('@microsoft/overreact');

const { useSpecs } = require('./shared');

function useODataAction(specs, path, sideEffectFn, variables) {
  const dataRefId = useDataRefId();
  const { actionSpec } = useSpecs(specs, path);

  return useFetch(dataRefId, actionSpec, variables);
}

module.exports = {
  useODataAction,
};
