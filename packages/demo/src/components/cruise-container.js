import React, { useCallback, useMemo } from 'react';

import { usePromisify } from '@microsoft/overreact';
import { useCruise } from '../hooks/use-cruise';
import { CruiseView } from './cruise-view';

export function CruiseContainer(props) {
  const { name } = props;

  const variables = useMemo(() => ({
    locator: {
      descriptor: { name },
      order: ['name'],
    },
  }), [name]);

  const config = useMemo(() => ({
    fetch: { postponeRead: true },
    refetch: { postponeRead: false },
  }), []);

  const [{ data }, { refetch: loadCruise }] = useCruise(variables, config);
  const [loadCruiseAsync] = usePromisify([loadCruise]);

  const onRefreshCruise = useCallback(() => {
    loadCruiseAsync({}).then(response => console.log(response));
  }, [loadCruiseAsync]);

  return (<CruiseView cruise={data} refresh={onRefreshCruise} />);
}
