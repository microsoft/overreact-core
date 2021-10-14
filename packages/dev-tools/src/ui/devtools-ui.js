import _ from 'underscore';
import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { add as addRequest } from './slices/requests';
import { updateStore } from './slices/store';
import port from './port';

export function DevToolsUI(props) {
  const dispatch = useDispatch();
  const requests = useSelector(state => state.request.requests);
  const stores = useSelector(state => state.store.stores);

  console.log(stores);

  const handleMessageFromAgent = useCallback(msg => {
    if (msg.request) {
      dispatch(addRequest({ request: msg.request }));
    }

    if (msg.store) {
      dispatch(updateStore({ store: msg.store }));
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
      <h1>Requests</h1>
      <ul>
        { requests && requests.map(request => (
          <li>{JSON.stringify(request, null, 2)}</li>
        ))}
      </ul>
    </div>
  );
}
