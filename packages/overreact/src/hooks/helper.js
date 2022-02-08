import _ from 'underscore';
import { responseTypes } from '../spec';
import { FetchPolicy } from '../middleware';

export function getDataFromRecords(records, responseContract) {
  const values = _.map(records, record => record.getData());
  return responseContract.responseType === responseTypes.COLL ? values : values[0];
}

function getDefaultLookupCacheFn(varKeySelector, dataKeySelector) {
  return (items, variables) => _.find(items,
    item => dataKeySelector(item) === varKeySelector(variables));
}

export function getLookupCacheFn(lookupCacheFn, spec, fetchPolicy) {
  const { requestContract, responseContract } = spec;
  if (fetchPolicy === FetchPolicy.StoreOrNetwork) {
    if (lookupCacheFn) {
      return lookupCacheFn;
    }

    if (_.isFunction(requestContract.keySelector)
      && _.isFunction(responseContract.keySelector)
      && responseContract.responseType === responseTypes.ENTITY) {
      return getDefaultLookupCacheFn(requestContract.keySelector, responseContract.keySelector);
    }
  }

  return null;
}
