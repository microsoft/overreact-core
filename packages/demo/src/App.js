import React from 'react';
import {
  DataFetcher,
  Environment,
  Store,
} from '@microsoft/overreact';

// Previously defined schema and network requestor
import { networkRequestor } from './network-requestor';
import { schema } from './schema';

// React component that will talk to the TripPin service
import { PeopleContainer } from './people-container';

// define an Environment object to configure overreact
const store = new Store();
const tripPinEnvironment = new Environment(networkRequestor, schema, store, []);

export default function App() {
  return (
    <div className="app-container">
      <DataFetcher environment={tripPinEnvironment}>
        <PeopleContainer userName="russellwhyte" />
      </DataFetcher>
    </div>
  );
}
