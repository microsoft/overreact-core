const pluralize = require('pluralize');

const { snakeToPascalCase } = require('./utils');

function createConfigObj(pathName, isCall) {
  const paths = pathName.split(':');
  let hookName = '';
  for (let i = paths.length - 1; i >= 0; i -= 1) {
    hookName = `${snakeToPascalCase(paths[i])}${hookName}`;
  }

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
