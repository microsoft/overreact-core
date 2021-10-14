import {
  createRequestContract,
  createResponseContract,
  createSpec,

  requestVerbs,
  responseTypes,
  specTypes,
} from '@microsoft/overreact';

import { schema } from '../schema';

function odataUriFactory(params) {
  const { variables } = params;
  const { locator } = variables;
  const { descriptor } = locator;
  const { name } = descriptor;

  return `/Cruise('${name}')`;
}

const odataHeaderFactory = () => {};
const odataPayloadFactory = param => param.data;

const requestContract = createRequestContract({
  schema,
  dataPath: 'cruise',
  verb: requestVerbs.POST,
  uriFactoryFn: odataUriFactory,
  headerFactoryFn: odataHeaderFactory,
  payloadFactoryFn: odataPayloadFactory,
  keySelector: p => p.name,
});

const responseContract = createResponseContract({
  requestContract,
  responseType: responseTypes.ENTITY,
  keySelector: p => p.name,
});

export const cruiseFetchSpec = createSpec(requestContract, responseContract, specTypes.FETCH, null);
export const cruiseRefetchSpec = createSpec(
  requestContract, responseContract, specTypes.REFETCH, null,
);
