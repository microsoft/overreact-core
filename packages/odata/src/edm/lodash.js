const _ = require('underscore');

function castPath(value, object) {
  if (_.isArray(value)) {
    return value;
  }

  if (_.has(object, value)) {
    return [value];
  }

  return _.compact(value.split(/[[\].]/));
}

function get(object, path, defaultValue) {
  let sub;
  let i;
  const keyPath = castPath(path, object);

  for (i = 0, sub = object; i < keyPath.length; i += 1) {
    if (!_.isObject(sub)) {
      return defaultValue;
    }

    sub = sub[keyPath[i]];

    if (_.isUndefined(sub)) {
      return defaultValue;
    }
  }

  return sub;
}

module.exports = {
  get,
};
