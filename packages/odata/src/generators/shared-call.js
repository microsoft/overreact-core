const {
  createResponseContract,
  responseTypes,
} = require('@microsoft/overreact');

function createUriFactory(edmModel, visitedSchemas, isColl) {
  return params => {
    const { variables } = params;
    const { locator, ...rest } = variables;
    const { descriptor, order } = locator;

    let edmResource = edmModel;
    for (let i = 0; i < visitedSchemas.length; i += 1) {
      const { schema: visitedSchema, name } = visitedSchemas[i];
      const { $$ref, Name, Namespace } = visitedSchema;

      if ($$ref) {
        if (isColl && (i === visitedSchemas.length - 2)) {
          // if the action/function is bound to a collection,
          // we should not use the $withKey nav to select
          // an entity. Instead, we'll navigate directly from
          // the second to last schema, which is the entity collection
          // that the action/function is bound to.
          edmResource = edmResource[name];
        } else {
          const navId = descriptor[order[i]];
          edmResource = edmResource[name].$withKey(navId);
        }
      } else if (Name && Namespace) {
        edmResource = edmResource[`${Namespace}.${Name}`];
      }
    }

    return edmResource.$call(rest).path;
  };
}

function odataHeaderFactory(params) {
  const { headers } = params;
  return headers;
}

function odataPayloadFactory(params) {
  const { data } = params;
  return JSON.stringify(data);
}

function createODataResponseContract(requestContract, action) {
  const { ReturnType } = action;
  if (ReturnType) {
    const { type, items, schema } = ReturnType;
    if (type === 'array') {
      return createResponseContract({
        requestContract,
        responseType: responseTypes.COLL,
        keySelector: r => r[items.schema.$$ODataExtension.Key[0]],
        processorFn: r => r.values,
      });
    }
    // entity
    if (schema) {
    // complex type
      return createResponseContract({
        requestContract,
        responseType: responseTypes.ENTITY,
        keySelector: r => r[schema.$$ODataExtension.Key[0]],
        processorFn: r => r,
      });
    }
  }

  // primitives
  return createResponseContract({
    requestContract,
    responseType: responseTypes.ENTITY,
    keySelector: r => r,
    processorFn: r => r,
  });
}

module.exports = {
  createUriFactory,
  odataHeaderFactory,
  odataPayloadFactory,
  createODataResponseContract,
};
