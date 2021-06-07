// this hook is used to create/retrieve a dataRefId, which
// will then be used/shared amongst useFetch/useMutation/usePagination/etc hooks.
// In a React component settings, this will act as a "component ID", where
// all the custom hooks share a same dataRefId, so they can work on the same
// set of data records.
// For example, a "usePagination" hook will retrieve a set of records, and store
// the data IDs in a certain dataRefId "A". Consequent "useMutation" call
// bound to the same dataRefId will have immediate access to the current data from pagination.
// Next time the mutation call tries to CREATE a new entity, it will now where
// to append the new entity.

// The hook adds/retrieves dataRefId from a pool in context. An optional "name"
// can be given so a compnent can restore previous data state even after unmounting.
// A direct example will be when a Paginated timeline component was unmounted/remounted,
// previously loaded feeds and scroll position can be reinstiated.
import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEnvironment } from '../environment';

function generateNewDataRefId() {
  return uuidv4();
}

export function useDataRefId(name, environmentLookupFn) {
  const environment = useEnvironment(environmentLookupFn);
  const dataRefIdRef = useRef(null);

  if (!name && dataRefIdRef.current) {
    return dataRefIdRef.current;
  }

  if (environment) {
    if (name) {
      // when using named dataRefId, we'll want to preserve it.
      if (!environment.dataRefIdPool[name]) {
        environment.dataRefIdPool[name] = generateNewDataRefId();
      }

      dataRefIdRef.current = environment.dataRefIdPool[name];
    } else {
      dataRefIdRef.current = generateNewDataRefId();
    }
  }

  return dataRefIdRef.current;
}
