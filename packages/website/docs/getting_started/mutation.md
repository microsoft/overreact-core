---
id: mutation
title: Mutating Data 
---

## What's a "Mutation"?

A "mutation" is an event to update data on the server. When a mutation completes, the data on the server must be updated, and client state should reflect the server change at the same time. A mutation could also cause "side effects" that leads to more complex server/client state change, beyond what users have explicitly requested.

## An example

Let's say you want to create a `People` entity on the TripPin service. The plain 
HTTP POST request would look like this:

```
POST https://services.odata.org/v4/(S(34wtn2c0hkuk5ekg0pjr513b))/TripPinServiceRW/People HTTP/1.1
OData-Version: 4.0
OData-MaxVersion: 4.0
Content-Length: 428
Content-Type: application/json
{
    'UserName':'lewisblack',
    'FirstName':'Lewis',
    'LastName':'Black',
    'Emails':[
        'lewisblack@example.com'
    ],
    'AddressInfo':[
        {
            Address: '187 Suffolk Ln.',
            City: {
CountryRegion: 'United States',
Name: 'Boise',
Region: 'ID'
            }
        }
    ],
    'Gender': 'Male',
    'Concurrency':635519729375200400
}
```

In order to make this request in overreact, we'll need to create a mutation spec, and handle the call using [`useMutation`](/api/use_mutation).

### Mutation Spec

Mutation specs are similar to a data spec for `useFetch`. The only differences are:
1. It has a mutation spec type of `MUTATION`.
1. `verb` in request contract may be `POST`, `PATCH`, or `DELETE`, based on the type of mutation requested.
2. Users must provide mutation "payload" via `payloadFactoryFn` in request contract, as well as necessary headers via `headerFactoryFn`.
3. A `sideEffectFn` function can be provided to `createSpec` to perform additional side effects after mutation completes.

In our example, let's create the spec like this:

```javascript title="people-create-spec.js"
import {
    createRequestContract,
    createResponseContract,
    createSpec,

    requestVerbs,
    responseTypes,
    specTypes,
} from '@microsoft/overreact';

import { schema } from './schema';

function odataUriFactory() {
    // Because in this example we'll be adding a new "People"
    // entity, our target URI will be an OData collection,
    // so no need to identify single entity here.
    return `/People`;
}

function odataHeaderFactory() {
    // explicitly set HTTP request headers
    return {
        'Content-Type': 'application/json',
    };
}

function odataPayloadFactory(params) {
    // Create the JSON payload
    const { data } = params;
    return JSON.stringify(data);
}

const requestContract = createRequestContract({
    schema,
    dataPath: 'people',
    // Create means to POST data
    verb: requestVerbs.POST,
    uriFactoryFn: odataUriFactory,
    headerFactoryFn: odataHeaderFactory,
    keySelector: p => p.UserName,
});

const responseContract = createResponseContract({
    requestContract: requestContract,
    responseType: responseTypes.ENTITY,
    keySelector: p => p.UserName,
});

function sideEffectFn() {
    // TODO:
    // OData protocol specifies that only the ID/ETag shall be 
    // returned for entity creation requests, so on our client
    // we need to explicitly:
    //   1. Construct a new People entity with the payload data
    //      and actual entity ID from response
    //   2. Insert this entity into People collection in our data store
}

export const peopleCreateSpec = 
    createSpec(requestContract, responseContract, specTypes.MUTATION, sideEffectFn);
```

### Setup useMutation

Next let's update `PeopleContainer` to support adding more people to the view:

```jsx {4,9-10,26-39,48} title="people-container.js"
import React, { useMemo } from 'react';
import { 
    useFetch,
    useMutation,
    useDataRefId,
} from '@microsoft/overreact';

import { peopleSpec } from './people-spec';
import { peopleCreateSpec } from './people-create-spec';
import { mockPeopleData } from './mocks';
import { PeopleView } from './people-view';

export function PeopleContainer(props) {
    const { userName } = props;
    const dataRefId = useDataRefId();

    const variables = useMemo(() => ({
        locator: {
            descriptor: { people: userName },
            order: ['people'],
        },
    }), [userName]);

    const [data] = useFetch(dataRefId, peopleSpec, variables);

    const createFn = useMutation(dataRefId, peopleCreateSpec, {
        onComplete: (response) => console.log('Created'),
        preemptiveResponseFn: (dataItems, payload) => {
            return [
                ...dataItems,
                ...payload,
            ];
        },
    });

    const createPeople = useCallback(
        () => createFn({}, { data: mockPeopleData }), 
        [createFn, mockPeopleData]
    );

    return (
        <div>
            { data && <PeopleView 
                firstName={data.FirstName}
                lastName={data.LastName}
                address={data.AddressInfo[0]}
            />}
            <button onClick={createPeople}>Create</button>
        </div>
    );
}
```

Now when you click on "Create" button, a new `People` entity should be created.

## Advanced Usage

You might have noticed some extra configurations to the `useMutation` call - `onComplete` and `preemptiveResponseFn`. These callbacks provide extra capabilities to the mutation call, to support advanced scenarios to make UI more responsive. Please see the [API references for `useMutation`](/api/use_mutation) for details.


