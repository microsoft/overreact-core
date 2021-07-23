const pluralize = require('pluralize');

const { snakeToPascalCase } = require('./utils');

function createConfigObj(pathName, isCall) {
  const hookName = pathName.split(':').pop();
  const hookNameCamel = snakeToPascalCase(hookName);

  if (isCall) {
    return [{
      type: 'call',
      name: `use${hookNameCamel}`,
    }];
  }

  return [{
    type: 'entity',
    name: `use${hookNameCamel}`,
  }, {
    type: 'coll',
    name: `use${pluralize(hookNameCamel)}`,
  }];
}

module.exports = {
  createConfigObj,
};
