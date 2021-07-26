const {
  useFetch,
  useDataRefId,
} = require('@microsoft/overreact');

const { useSpecs } = require('./use-specs');

function useODataCall(specs, path, sideEffectFn, variables) {
  const dataRefId = useDataRefId();
  const { actionSpec } = useSpecs(specs, path);

  return useFetch(dataRefId, actionSpec, variables);
}

module.exports = {
  useODataCall,
};
