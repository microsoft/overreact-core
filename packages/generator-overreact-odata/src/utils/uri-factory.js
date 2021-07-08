const pascalToSnakeCase = str => str.split(/(?=[A-Z])/).join('_').toLowerCase();

function descriptorNameConverter(visitedSchema, schemaNameMapper) {
  const { $$ref, Name } = visitedSchema;
  let candidate = '';
  if ($$ref) {
    candidate = $$ref;
  }
  if (Name) {
    candidate = Name;
  }

  return `${pascalToSnakeCase(schemaNameMapper(candidate))}__id`;
}

function generateDescriptorList(visitedSchemas, schemaNameMapper, isColl) {
  if (isColl) {
    return visitedSchemas
      .map(({ schema }) => descriptorNameConverter(schema, schemaNameMapper))
      .pop();
  }
  return visitedSchemas
    .map(({ schema }) => descriptorNameConverter(schema, schemaNameMapper));
}

function odataUriFactory(visitedSchemas, schemaNameMapper, isColl) {
  // let edmResource = edmModel;
  let edmPath = 'edm';

  if (isColl) {
    for (let i = 0; i < visitedSchemas.length - 1; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref } = visitedSchema;

      if ($$ref) {
        const navId = descriptorNameConverter(visitedSchema, schemaNameMapper);
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
        const navId = descriptorNameConverter(visitedSchema, schemaNameMapper);
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
  odataUriFactory,
  generateDescriptorList,
};
