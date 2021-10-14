import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Pivot, PivotItem } from '@fluentui/react';

import { add as addRequest } from './slices/requests';
import port from './port';

import { RequestsTab } from './tabs/requests';

export function DevToolsUI() {
  const dispatch = useDispatch();

  const handleMessageFromAgent = useCallback(msg => {
    const { type } = msg;

    if (type === 'on-request' || type === 'on-error') {
      dispatch(addRequest({ request: msg.request }));
    }
    if (type === 'get-store') {
      // TODO
    }
  }, [dispatch]);

  useEffect(() => {
    port.onMessage.addListener(msg => handleMessageFromAgent(msg));
  }, [handleMessageFromAgent]);

  return (
    <div>
      <Pivot
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'hidden',
        }}
        styles={{
          root: {
            height: 44,
            borderBottom: '1px solid rgb(237, 235, 233)',
          },
          itemContainer: {
            height: 'calc(100% - 44px)',
          },
        }}
      >
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
