import _ from 'underscore';
import { OVERREACT_ID_FIELD_NAME, createOverreactId } from '../../store/consts';

export function getSideEffectCacheStoreHelpers(environment) {
  const { store, schema: { schemaToModelMapping } } = environment;
  const tryMergeItemsToCacheStore = ({
    items,
    schemaName,
    itemKeySelector,
    parentSchameName,
    parentId,
  }) => {
    const modelName = schemaToModelMapping[schemaName];
    const recordGroup = store.getRecordGroup(modelName);
    const keysInCache = recordGroup.records.map(r => itemKeySelector(r.data));
    const itemsToAdd = _.filter(items, item => !_.include(keysInCache, itemKeySelector(item)));
    const itemsToAddWithOverreactId = itemsToAdd.map((item) => {
      const overreactId = createOverreactId(
        itemKeySelector(item),
        parentId,
        parentSchameName
      );

      return {
        ...item,
        [OVERREACT_ID_FIELD_NAME]: overreactId,
      };
    });
    recordGroup.addOrUpdateRecords(itemsToAddWithOverreactId);
    const ids = itemsToAddWithOverreactId.map(item => item[OVERREACT_ID_FIELD_NAME]);
    recordGroup.notify('entitiesCreated', ids);

    const itemsToMerge = _.filter(items, item => _.include(keysInCache, itemKeySelector(item)));
    const itemsMerged = itemsToMerge.map((itemToMerge) => {
      const key = itemKeySelector(itemToMerge);
      const records = recordGroup.getRecordsByEntityKeys(itemKeySelector, [key]);

      return {
        ...records[0].data,
        ...itemToMerge,
        [OVERREACT_ID_FIELD_NAME]: records[0].id,
      };
    });
    recordGroup.addOrUpdateRecords(itemsMerged);
  };

  const tryDeleteItemsInCacheStore = ({
    keysToDelete,
    schemaName,
    itemKeySelector,
  }) => {
    const modelName = schemaToModelMapping[schemaName];
    const recordGroup = store.getRecordGroup(modelName);

    const recordsToRemove = recordGroup.getRecordsByEntityKeys(itemKeySelector, keysToDelete);
    const recordsIdsToRemove = recordsToRemove.map(r => r.id);

    recordGroup.deleteRecords(recordsIdsToRemove);
    recordGroup.notify('entitiesDeleted', recordsIdsToRemove);
  };

  return {
    tryMergeItemsToCacheStore,
    tryDeleteItemsInCacheStore,
  };
}
