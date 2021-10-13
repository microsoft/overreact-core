import React, {
  useState, useCallback, useMemo, useReducer, useEffect,
} from 'react';
import { useSelector } from 'react-redux';

import {
  Label,
  DetailsList,
  Selection,
  SelectionMode,
  DetailsListLayoutMode,

  mergeStyleSets,
  Depths,
} from '@fluentui/react';

const classNames = mergeStyleSets({
  tabContainer: {
    display: 'flex',
    flex: 1,
  },
  listHeader: {
    fontSize: 12,
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
  fieldKey: {
    fontWeight: '600',
    marginRight: 6,
  },
});

function RequestDetailPane(props) {
  const { request } = props;
  const {
    id, uri, verb, headers, payload, spec,
  } = request;

  return (
    <div>
      <Label>Request details</Label>
      <ul>
        <li>
          <span className={classNames.fieldKey}>id:</span>
          {id}
        </li>
        <li>
          <span className={classNames.fieldKey}>uri:</span>
          {uri}
        </li>
        <li>
          <span className={classNames.fieldKey}>verb:</span>
          {verb}
        </li>
      </ul>
      <Label>Headers</Label>
      <ul>
        {Object.entries(headers).map(([key, value]) => (
          <li>
            <span className={classNames.fieldKey}>{`${key}:`}</span>
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RequestsTab() {
  const [isRightPaneShown, setIsRightPaneShown] = useState(false);
  const [currentSelection, setCurrentSelection] = useState();
  const [tick, forceRerender] = useReducer(x => x + 1, 0);

  const requests = useSelector(state => state.request.requests);

  const columns = useMemo(() => [{
    key: 'uri',
    name: 'Name',
    fieldName: 'uri',
    minWidth: 200,
    className: classNames.listHeader,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    isPadded: true,
    onRender: item => <span>{item.uri}</span>,
  }, {
    key: 'verb',
    name: 'Verb',
    fieldName: 'verb',
    minWidth: 60,
    className: classNames.listHeader,
    isRowHeader: true,
    isResizable: false,
    data: 'string',
    isPadded: true,
    onRender: item => <span>{item.verb}</span>,
  }], []);

  const getKey = useCallback(item => item.id, []);

  const selection = useMemo(() => new Selection({
    onSelectionChanged: () => {
      setIsRightPaneShown(true);
      forceRerender();
    },
  }), [forceRerender]);

  useEffect(() => {
    if (tick && selection.getSelectedCount() === 1) {
      setCurrentSelection(selection.getSelection()[0]);
    }
  }, [tick, selection]);

  return (
    <div className={classNames.tabContainer}>
      <div className={classNames.leftPane}>
        <DetailsList
          items={requests}
          compact
          columns={columns}
          getKey={getKey}
          setKey="none"
          selection={selection}
          selectionMode={SelectionMode.single}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible
        />
      </div>
      {
        isRightPaneShown && currentSelection && (
        <div className={classNames.rightPane}>
          <RequestDetailPane request={currentSelection} />
        </div>
        )
      }
    </div>
  );
}
