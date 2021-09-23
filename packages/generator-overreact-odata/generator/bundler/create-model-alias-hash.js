function createModelAliasHash(modelAliases) {
  // because modelAliases' keys are aliases, we convert the object
  // to another object, with its keys being the model names, and
  // corresponding values being an array of given aliases.
  const hash = {};

  Object.entries(modelAliases).forEach(([k, v]) => {
    if (!hash[v]) {
      hash[v] = [];
    }

    hash[v].push(k);
  });

  return hash;
}

module.exports = {
  createModelAliasHash,
};
