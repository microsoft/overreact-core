import {
  useFetch,
  useDataRefId,
} from '@microsoft/overreact';

import { useSpecs } from './shared';

export function useODataAction(specs, path, sideEffectFn, variables) {
  const dataRefId = useDataRefId();
  const { actionSpec } = useSpecs(specs, path);

  return useFetch(dataRefId, actionSpec, variables);
}
