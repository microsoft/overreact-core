import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import ReactJson from 'react-json-view';

import {
  mergeStyleSets,
} from '@fluentui/react';

const classNames = mergeStyleSets({
  tabContainer: {
    display: 'flex',
    flex: 1,
    height: '100%',
    overflow: 'auto',
    padding: 20,
  },
});

export function SchemaTab() {
  const schema = useSelector(state => state.schema.schema);

  const onSelect = useCallback(
    select => {
      const {
        name,
        value,
        namespace,
      } = select;

      if (name === 'key' && namespace.length >= 2 && namespace[namespace.length - 2] === 'dataRefs') {
        // TODO
        console.log('USER SELECTED DATAREF: %s', value);
      }
    },
    [],
  );

  return (
    <div className={classNames.tabContainer}>
      <ReactJson
        src={schema}
        onSelect={onSelect}
        name={false}
        displayDataTypes={false}
      />
    </div>
  );
}
