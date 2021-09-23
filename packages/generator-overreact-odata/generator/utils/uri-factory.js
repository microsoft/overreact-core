const descriptorSuffix = '_id';

function descriptorNameConverter(visitedSchema, aliasHashMap) {
  const { $$ref, Name } = visitedSchema;
  const candidate = $$ref || Name || '';

  return `${aliasHashMap[candidate][0]}${descriptorSuffix}`;
}

function generateDescriptorList(visitedSchemas, aliasHashMap) {
  return visitedSchemas
    .map(({ schema }) => descriptorNameConverter(schema, aliasHashMap));
}

function odataCallUriFactory(visitedSchemas, rootSchema, aliasHashMap, isColl) {
  const edmPathSegments = [];
  for (let i = 0; i < visitedSchemas.length; i += 1) {
    const { schema: visitedSchema, name } = visitedSchemas[i];
    const { $$ref } = visitedSchema;

    if ($$ref) {
      if (isColl && (i === visitedSchemas.length - 2)) {
        // if the action/function is bound to a collection,
        // we should not use the $withKey nav to select
        // an entity. Instead, we'll navigate directly from
        // the second to last schema, which is the entity collection
        // that the action/function is bound to.
        edmPathSegments.push(`.${name}`);
      } else {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPathSegments.push(`.${name}.$withKey(${navId})`);
      }
    }
  }

  const { schema: { Namespace, Name } } = rootSchema;
  edmPathSegments[edmPathSegments.length - 1] += `['${Namespace}.${Name}']`;
  edmPathSegments.push('.$call(rest);');

  return edmPathSegments;
}

function odataUriFactory(visitedSchemas, aliasHashMap, isColl) {
  const edmPathSegments = [];

  if (isColl) {
    for (let i = 0; i < visitedSchemas.length - 1; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref } = visitedSchema;

      if ($$ref) {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPathSegments.push(`.${name}.$withKey(${navId})`);
      }
    }

    const { name } = visitedSchemas[visitedSchemas.length - 1];
    edmPathSegments.push(`.${name};`);
  } else {
    // entity

    for (let i = 0; i < visitedSchemas.length; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref } = visitedSchema;

      if ($$ref) {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPathSegments.push(`.${name}.$withKey(${navId})`);
      }
    }

    edmPathSegments[edmPathSegments.length - 1] += ';';
  }
  return edmPathSegments;

  /*
  let search = {};
  if (isColl) {
    // pagination
    const { cursorIndex, pageSize, ...restSearch } = rest;
    search = {
      top: cursorIndex,
      count: true,
      skip: pageSize,
      ...restSearch,
    };
  } else {
    search = {
      ...rest,
    };
  }

  const parsedSearch = parseSearch(search);
  const searchCompact = _.omit(parsedSearch, x => _.isNull(x) || _.isUndefined(x));
  const searchString = _.isEmpty(searchCompact) ? '' : `?${queryString.stringify(searchCompact)}`;

  return `${path}${searchString}`;
  */
}

module.exports = {
  odataCallUriFactory,
  odataUriFactory,
  generateDescriptorList,
};
