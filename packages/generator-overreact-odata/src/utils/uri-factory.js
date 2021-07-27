const descriptorSuffix = '_id';

function descriptorNameConverter(visitedSchema, aliasHashMap) {
  const { $$ref, Name } = visitedSchema;
  const candidate = $$ref || Name || '';

  return `${aliasHashMap[candidate][0]}${descriptorSuffix}`;
}

function generateDescriptorList(visitedSchemas, aliasHashMap, isColl, isCall = false) {
  const descriptorList = visitedSchemas
    .map(({ schema }) => descriptorNameConverter(schema, aliasHashMap));

  if (isColl) {
    descriptorList.pop();
  }

  if (isCall) {
    descriptorList.pop();
  }

  return descriptorList;
}

function odataCallUriFactory(visitedSchemas, rootSchema, aliasHashMap, isColl) {
  let edmPath = 'edm';
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
        edmPath += `.${name}`;
      } else {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPath += `.${name}.$withKey(${navId})`;
      }
    } /* else if (Name && Namespace) {
      edmPath += `['${Namespace}.${Name}']`;
    } */
  }

  const { schema: { Namespace, Name } } = rootSchema;
  edmPath += `['${Namespace}.${Name}']`;

  return `${edmPath}.$call(rest).path`;
}

function odataUriFactory(visitedSchemas, aliasHashMap, isColl) {
  // let edmResource = edmModel;
  let edmPath = 'edm';

  if (isColl) {
    for (let i = 0; i < visitedSchemas.length - 1; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref } = visitedSchema;

      if ($$ref) {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPath += `.${name}.$withKey(${navId})`;
      }
    }

    const { name } = visitedSchemas[visitedSchemas.length - 1];
    edmPath += `.${name}`;
  } else {
    // entity

    for (let i = 0; i < visitedSchemas.length; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref } = visitedSchema;

      if ($$ref) {
        const navId = descriptorNameConverter(visitedSchema, aliasHashMap);
        edmPath += `.${name}.$withKey(${navId})`;
      }
    }
  }
  return `${edmPath}.path`;

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
