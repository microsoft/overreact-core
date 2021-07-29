const _ = require('underscore');
const queryString = require('query-string');

const { parseSearch } = require('./parse-search');

const DEFAULT_PAGE_SIZE = 20;

function composeSearchString(variables, edmEntity) {
  const { cursorIndex } = variables;
  const initialSearch = _.omit(variables, ['locator', 'cursorIndex', 'skip']);
  const search = {
    top: DEFAULT_PAGE_SIZE,
    count: true,
    skip: cursorIndex,
    ...initialSearch,
  };

  const parsedSearch = parseSearch(search, edmEntity);
  const searchCompact = _.omit(parsedSearch, x => _.isNull(x) || _.isUndefined(x));
  const searchString = _.isEmpty(searchCompact) ? '' : `?${queryString.stringify(searchCompact)}`;

  return searchString;
}

module.exports = {
  composeSearchString,
};
