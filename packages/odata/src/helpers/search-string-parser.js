import _ from 'underscore';
// support a mongoDB like orderby object for now: { age : -1, name: 1 }
// for backward compatibility, support array format: [['age', 'desc'], ['name', 'asc]]
function parseOrderBy(orderby) {
  function lowerCaseOrderValue(value) {
    return _.map(value, (v, index) => (index === 1 ? v.toLowerCase() : v));
  }

  if (_.isEmpty(orderby)) {
    return {};
  }

  let $orderby;
  if (_.isArray(orderby)) {
    $orderby = _.map(orderby, value => lowerCaseOrderValue(value).join(' ')).join(',');
  } else {
    $orderby = _.map(orderby, (value, key) => `${key} ${value > 0 ? 'asc' : 'desc'}`).join(',');
  }

  return {
    $orderby,
  };
}

function parseFilter(filter) {
  if (_.isEmpty(filter) || _.isEmpty(filter.where)) {
    return {};
  }

  return {
    $filter: filter.where,
  };
}

function parseTop(top) {
  if (!top) {
    return {};
  }

  return {
    $top: top,
  };
}

function parseSkip(skip) {
  if (!skip) {
    return {};
  }

  return {
    $skip: skip,
  };
}

function parseCount(count) {
  if (count === undefined) {
    return {};
  }

  return {
    $count: count,
  };
}

function parseSelect(select, resource) {
  if (!select) return {};
  const parsed = {};
  const elementType = resource.type.elementType ? resource.type.elementType : resource.type;
  const { navigationPropertyNames } = elementType;
  const $select = select.filter(item => !_.contains(navigationPropertyNames, item)).join(',');
  const $expand = select.filter(item => _.contains(navigationPropertyNames, item)).join(',');

  if ($select.length) {
    parsed.$select = $select;
  }

  if ($expand.length) {
    parsed.$expand = $expand;
  }

  return parsed;
}

export function parseSearch(search, edmResource) {
  const {
    orderby,
    filter,
    top,
    skip,
    count,
    select,
    ...nonODataSearch
  } = search;

  return {
    ...parseOrderBy(orderby),
    ...parseFilter(filter),
    ...parseTop(top),
    ...parseSkip(skip),
    ...parseCount(count),
    ...parseSelect(select, edmResource),
    ...nonODataSearch,
  };
}
