import React, {
  useState, useCallback, useMemo, useReducer, useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import ReactJson from 'react-json-view';
import {
  Label,

  mergeStyleSets,
  Depths,
} from '@fluentui/react';

const classNames = mergeStyleSets({
  tabContainer: {
    display: 'flex',
    flex: 1,
  },
  leftPane: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightPane: {
    display: 'flex',
    minWidth: 300,
    flexDirection: 'column',
    padding: 10,
    boxShadow: Depths.depth4,
  },
});

function Store(props) {
  const { stores } = props;

  const onSelect = useCallback(select => {
    window._select = select;
    console.log(select);
  }, []);

  return (
    <div>
      <Label>Stores</Label>
      <ReactJson
        src={stores}
        name={null}
        collapsed={2}
        onSelect={onSelect}
      />
    </div>
  );
}

export function StoreTab() {
  // const [tick, forceRerender] = useReducer(x => x + 1, 0);

  const stores = useSelector(state => state.store.stores);

  return (
    <div className={classNames.tabContainer}>
      <div className={classNames.leftPane}>
        <Store stores={stores} />
      </div>
      <div className={classNames.rightPane}>
        datarefs
      </div>
    </div>
  );
}
