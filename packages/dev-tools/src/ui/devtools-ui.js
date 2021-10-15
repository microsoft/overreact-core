import _ from 'underscore';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Pivot, PivotItem } from '@fluentui/react';

import { add as addRequest } from './slices/requests';
import { updateStore } from './slices/store';
import { updateDataRef } from './slices/data-ref';
import { update as updateSchema } from './slices/schema';

import port from './port';

import { RequestsTab } from './tabs/requests';
import { StoreTab } from './tabs/store';
import { SchemaTab } from './tabs/schema';

export function DevToolsUI() {
  const dispatch = useDispatch();

  const handleMessageFromAgent = useCallback(msg => {
    const { type } = msg;
    if (msg.request) {
      if (type === 'on-request' || type === 'on-error') {
        dispatch(addRequest({ request: msg.request }));
      }
    }

    if (type === 'get-schema') {
      dispatch(updateSchema({ schema: msg.schema }));
    }

    if (type === 'store-update') {
      dispatch(updateStore({ store: msg.store }));
    }

    if (type === 'data-ref-update') {
      dispatch(updateDataRef({ dataRef: msg.dataRef }));
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
          <StoreTab />
        </PivotItem>
        <PivotItem
          headerText="Schema"
        >
          <SchemaTab />
        </PivotItem>
      </Pivot>
    </div>
  );
}
