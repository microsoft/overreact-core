const pluralize = require('pluralize');

function createConfigObj(pathName, isCall) {
  const hookName = pathName.split(':').pop();
  const hookNameCamel = hookName.split('_').map(s => `${s[0].toUpperCase()}${s.slice(1)}`).join('');

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
