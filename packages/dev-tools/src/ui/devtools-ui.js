import _ from 'underscore';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Pivot, PivotItem } from '@fluentui/react';

import { add as addRequest } from './slices/requests';
import { updateStore } from './slices/store';
import port from './port';

import { RequestsTab } from './tabs/requests';

export function DevToolsUI() {
  const dispatch = useDispatch();
  const stores = useSelector(state => state.store.stores);

  console.log(stores);

  const handleMessageFromAgent = useCallback(msg => {
    const { type } = msg;
    if (msg.request) {

    if (type === 'on-request' || type === 'on-error') {
      dispatch(addRequest({ request: msg.request }));
    }

    if (msg.store) {
      dispatch(updateStore({ store: msg.store }));
    if (type === 'get-store') {
      // TODO
    }
    }
  }, [dispatch]);

  useEffect(() => {
    port.onMessage.addListener(msg => handleMessageFromAgent(msg));
  }, [handleMessageFromAgent]);

  const renderStore = useCallback((storeName, store) => (
    <div>
      <h2>{storeName}</h2>
      <ul>
        {store && _.keys(store).map(key => (
          <li key={key}>{`${key}: ${JSON.stringify(store)}`}</li>
        ))}
      </ul>
    </div>
  ), []);

  return (
    <div>
      <h1>Store</h1>
      <ul>
        { stores && _.chain(stores).keys().map(key => renderStore(key, stores[key])).value() }
      </ul>
      <Pivot>
        <PivotItem
          headerText="Requests"
        >
          <RequestsTab />
        </PivotItem>
        <PivotItem
          headerText="Store"
        >
          Placeholder for Store
        </PivotItem>
      </Pivot>
    </div>
  );
}
