const { makeEdmModel } = require('./make-edm-model');
const { generatePath } = require('./path-generator');

// Create a spec (data path) list from a known model aliases
function createSpecList(model, config) {
  const {
    rootPropertyModelName,
    rootPropertyName,
  } = config;

  const edm = makeEdmModel(model, config);

  return generatePath(
    edm,
    rootPropertyName,
    model[rootPropertyModelName],
    [{
      name: rootPropertyName,
      schema: model[rootPropertyModelName],
    }],
  );
}

module.exports = {
  createSpecList,
};
