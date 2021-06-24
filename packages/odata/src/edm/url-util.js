const _ = require('lodash');

function join(first, ...frags) {
  return frags.reduce((memo, frag) => {
    if (_.isEmpty(frag)) {
      return memo;
    }
    const eSlash = /\/$/.test(memo);
    const sSlash = /^\//.test(frag);

    if (!eSlash && !sSlash) {
      return `${memo}/${frag}`;
    }
    if (eSlash && sSlash) {
      return memo + frag.substring(1);
    }
    return memo + frag;
  }, first);
}

module.exports = {
  join,
};
