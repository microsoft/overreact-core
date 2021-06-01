---
id: quick_start
title: Quick Start
sidebar_label: Quick Start
slug: /
---

## Installation

Install overreact using `yarn` or `npm`:

```sh
yarn add @bingads-webui/overreact
```

## Setup your app

In this guide, we're going to build an app that talks with the infamous [TripPin](https://www.odata.org/getting-started/understand-odata-in-6-steps/) service, which exposes a typical OData endpoint at `https://services.odata.org/v4/TripPinServiceRW`

### Configure your network requestor

overreact doesn't explicitly use any specific API to issue network requests (`$.ajax`, `fetch`, etc.), instead, it allows you to customize how your application wants to make requests to the network. In our app, we'll go with the [`fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```jsx title="network-requestor.js"
export function networkRequestor(uri, requestVerb, headers, body) {
    const endpoint = 'https://services.odata.org/v4/TripPinServiceRW';
    const requestUrl = `${endpoint}${uri}`;

    return fetch(url, {
        method: requestVerb,
        headers,
        body: JSON.stringify(body),
    }).then(response => response.json());
}
```

### Configure a schema

A [schema](/concept/schema) describes what entities are available and what name (alias) your app should call those entities internally.

```jsx title="schema.js"
import { Schema } from '@bingads-webui/overreact';

const schemaToModelMapping = {
    people: 'People',
    trip: 'Trip',
    airline: 'Airline',
    // more entities go here ...
};

export const schema = new Schema(schemaToModelMapping, () => {});
```

### Initialize a DataFetcher

Now let's initalize overreact to run in your app. To do that, simply put a `DataFetcher` component in your app, and have it wrap all UI components that requires data operations:

```jsx title="app.js"
import React from 'react';
import { 
    DataFetcher,
    Environment,
    Store,
} from '@bingads-webui/overreact';

// Previously defined schema and network requestor
import { networkRequestor } from './network-requestor';
import { schema } from './schema';

// React component that will talk to the TripPin service
import { PeopleContainer } from './people-container';

export default function App() {
    // define an Environment object to configure overreact
    const store = new Store();
    const tripPinEnvironment = new Environment(networkRequestor, schema, store, []);

    return (
        <div className="app-container">
            <DataFetcher environment={tripPinEnvironment}>
                <PeopleContainer userName="russellwhyte" />
            </DataFetcher>
        </div>
    );
}
```

Now that overreact has now been initialized, we need to tell overreact how to construct actual network requests for different entities, and how to store them locally.

## Create data specs

In our app, we'll look for a specific `People` entity, whose name is "russellwhyte", from the TripPin service. To do that, let's create a data spec for `People`. This spec allows overreact to issue a HTTP GET call, like this:

> GET https://services.odata.org/v4/TripPinServiceRW/People('russellwhyte') HTTP/1.1

```jsx title="people-spec.js"
import {
    createRequestContract,
    createResponseContract,
    createSpec,

    requestVerbs,
    responseTypes,
    specTypes,
} from '@bingads-webui/overreact';

import { schema } from './schema';

function odataUriFactory(params) {
    const { variables } = params;
    const { locator } = variables;
    const { descriptor, order } = locator;
    const { userName } = descriptor;

    return `/People(${userName})`;
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

```

Finally, let's construct a React component that consumes the data.
## Create your first overreact UI component

By now, we have all the required pieces ready to make the actual network call. Let's assume our app contains two text field, showing a user's name and address from the TripPin service.

We begin by issuing the call using the `useFetch` hook from overreact.

```jsx title="people-container.js"
import React, { useMemo } from 'react';
import { 
    useFetch,
    useDataRefId,
} from '@bingads-webui/overreact';

import { peopleSpec } from './people-spec';
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

    return (data && <PeopleView 
        firstName={data.FirstName}
        lastName={data.LastName}
        address={data.AddressInfo[0]}
    >);
}
```

```jsx title="people-view.js"
import React from 'react';

export function PeopleView(props) {
    const { firstName, lastName, address } = props;
    const { Address } = address;

    return (
        <div className="people-view">
            <span>{`${firstName} ${lastName}`}</span>
            <span>{Address}</span>
        </div>
    );
}
```

That's it! Run your app and you should see a network request going out to `https://services.odata.org/v4/(S(wzb13shf21muw3is3clriogh))/TripPinServiceRW/People('russellwhyte')` (the actual URL listening to the requests), and the response should be rendered on the page.

## What's Next?

overreact does more than just fetching data from network. It also provides rich support for the following scenarios:

- [Data mutation](/getting_started/mutation)
- [Pagination](/getting_started/pagination)
- [Adding middleware](/getting_started/middleware)
- [Handling errors](/getting_started/error)

You can click on each topic to learn more details. Additionally, please go to [Data Structure](/concept/data_structure) section to learn about how overreact stores data internally.
