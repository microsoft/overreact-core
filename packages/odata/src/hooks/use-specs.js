const { useMemo } = require('react');

function useSpecs(specs, path) {
  // find the spec needed from path
  return useMemo(() => {
    const selectedSpecs = specs[path];

    if (!selectedSpecs) {
      return [{ error: `specs for path ${path} not found` }];
    }

    return selectedSpecs;
  }, [path, specs]);
}

module.exports = {
  useSpecs,
};
