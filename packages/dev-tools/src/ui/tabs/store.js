import _ from 'underscore';
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
  const { stores, setId } = props;

  const onSelect = useCallback(select => {
    if (select.name === 'id' || select.name === '_OVERREACT_ID') {
      setId(select.value);
    }
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

function DataRefs(props) {
  const { dataRefs, selectedDataId } = props;
  let filterResult = null;
  if (selectedDataId) {
    filterResult = _.pick(dataRefs, ref => _.contains(ref.idRefs, selectedDataId));
  }

  return (
    <div>
      <Label>{`Selected data: ${selectedDataId || 'store'}`}</Label>
      <Label>Components subscribe to this data:</Label>
      <ReactJson
        src={filterResult || dataRefs}
        name={null}
      />
    </div>
  );
}

export function StoreTab() {
  const [selectedDataId, setId] = useState(null);

  const stores = useSelector(state => state.store.stores);
  const dataRefs = useSelector(state => state.dataRef.dataRefs);

  return (
    <div className={classNames.tabContainer}>
      <div className={classNames.leftPane}>
        <Store stores={stores} setId={setId} />
      </div>
      <div className={classNames.rightPane}>
        <DataRefs dataRefs={dataRefs} selectedDataId={selectedDataId} />
      </div>
    </div>
  );
}
