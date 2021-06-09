import {
    createRequestContract,
    createResponseContract,
    createSpec,

    requestVerbs,
    responseTypes,
    specTypes,
} from '@microsoft/overreact';

import { schema } from './schema';

function odataUriFactory(params) {
    const { variables } = params;
    const { locator } = variables;
    const { descriptor } = locator;
    const { people } = descriptor;

    return `/People('${people}')`;
}

const odataHeaderFactory = () => {};

const requestContract = createRequestContract({
    schema,
    dataPath: 'people',
    verb: requestVerbs.GET,
    uriFactoryFn: odataUriFactory,
    headerFactoryFn: odataHeaderFactory,
    keySelector: p => p.UserName,
});

const responseContract = createResponseContract({
    requestContract: requestContract,
    responseType: responseTypes.ENTITY,
    keySelector: p => p.UserName,
});

export const peopleSpec = 
    createSpec(requestContract, responseContract, specTypes.FETCH, null);
