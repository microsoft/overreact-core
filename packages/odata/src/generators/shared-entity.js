import _ from 'underscore';
import queryString from 'query-string';

import {
  createResponseContract,
  responseTypes,
} from '@microsoft/overreact';

import { parseSearch } from '../helpers';

export function createUriFactory(edmModel, visitedSchemas, isColl) {
  return params => {
    const { variables } = params;
    const { locator, ...rest } = variables;
    const { descriptor, order } = locator;

    let edmResource = edmModel;
    if (isColl) {
      for (let i = 0; i < visitedSchemas.length - 1; i += 1) {
        const { schema: visitedSchema, name } = visitedSchemas[i];
        const { $$ref } = visitedSchema;

        if ($$ref) {
          const navId = descriptor[order[i]];
          edmResource = edmResource[name].$withKey(navId);
        }
      }

      const { name } = visitedSchemas[visitedSchemas.length - 1];
      edmResource = edmResource[name];
    } else {
      // entity

      for (let i = 0; i < visitedSchemas.length; i += 1) {
        const { schema: visitedSchema, name } = visitedSchemas[i];
        const { $$ref } = visitedSchema;

        if ($$ref) {
          const navId = descriptor[order[i]];
          edmResource = edmResource[name].$withKey(navId);
        }
      }
    }

    const { path } = edmResource;

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
  };
}

export function odataHeaderFactory(params) {
  const { headers } = params;
  return headers;
}

export function odataPayloadFactory(params) {
  const { data } = params;
  return JSON.stringify(data);
}

export function createODataResponseContract(requestContract, entitySchema, isColl) {
  const { $$ODataExtension } = entitySchema;

  if (!isColl) {
    // entity
    return createResponseContract({
      requestContract,
      responseType: responseTypes.ENTITY,
      keySelector: r => r[$$ODataExtension.Key[0]],
      processorFn: r => r,
    });
  }
  // collection
  return createResponseContract({
    requestContract,
    responseType: responseTypes.COLL,
    keySelector: r => r[$$ODataExtension.Key[0]],
    processorFn: r => r.values,
  });
}