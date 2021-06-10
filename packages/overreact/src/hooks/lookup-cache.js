import _ from 'underscore';
import { getRecordGroup } from '../store';

export function getCacheIds({
  store,
  requestContract,
  variables,
  lookupFn,
}) {
  const recordGroup = getRecordGroup(store, requestContract);
  const { records } = recordGroup;
  const cacheRawItems = _.map(records, record => record.data);
  const cacheHit = lookupFn(cacheRawItems, variables);
  const overreactIds = _.chain(_.flatten([cacheHit], true))
    .map(data => {
      const record = _.find(records, r => r.data === data);
      return record ? record.id : undefined;
    })
    .compact()
    .value();

  return overreactIds;
}
