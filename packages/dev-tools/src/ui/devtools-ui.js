import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { add as addRequest } from './slices/requests';
import port from './port';

export function DevToolsUI(props) {
  const dispatch = useDispatch();
  const requests = useSelector(state => state.request.requests);

  const handleMessageFromAgent = useCallback(msg => {
    dispatch(addRequest({ request: msg.request }));
  }, [dispatch]);

  useEffect(() => {
    port.onMessage.addListener(msg => handleMessageFromAgent(msg));
  }, [handleMessageFromAgent]);

  return (
    <div>
      <h1>Requests</h1>
      <ul>
        { requests && requests.map(request => (
          <li>{JSON.stringify(request, null, 2)}</li>
        ))}
      </ul>
    </div>
  );
}
