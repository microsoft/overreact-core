import _ from 'underscore';
import { getDataNode, createDataNode } from './schema-extension/schema-extension';

export function getRecordGroup(store, requestContract) {
  if (store) {
    const schemaNode = requestContract.getSchemaNode();
    const recordGroup = store.getRecordGroup(schemaNode.modelName);

    return recordGroup;
  }
  return null;
}

export function getRecordsById(store, requestContract, ids) {
  const recordGroup = getRecordGroup(store, requestContract);
  return recordGroup.getRecords(ids);
}

export function getRecordsByEntityKey(store, spec, keys) {
  const { requestContract, responseContract } = spec;
  const recordGroup = getRecordGroup(store, requestContract);
  const { keySelector } = responseContract;
  return recordGroup.getRecordsByEntityKeys(keySelector, keys);
}

export function getRecordsFromResponseDataArray(store, spec, dataArray) {
  const { responseContract } = spec;
  const { keySelector } = responseContract;
  const entityKeys = _.map(dataArray, d => keySelector(d));
  return getRecordsByEntityKey(store, spec, entityKeys);
}

export function getRecords(store, requestContract, key) {
  if (store) {
    const schemaNode = requestContract.getSchemaNode();
    const dataNode = getDataNode(schemaNode) || createDataNode(schemaNode, store);

    const dataIds = dataNode.getDataRef(key).idRefs;
    const recordGroup = getRecordGroup(store, requestContract);

    return recordGroup.getRecords(dataIds);
  }
  return null;
}

export function getDataRef(store, requestContract, dataRefId) {
  if (store) {
    const schemaNode = requestContract.getSchemaNode();
    const dataNode = getDataNode(schemaNode) || createDataNode(schemaNode, store);
    return dataNode && dataNode.getDataRef(dataRefId);
  }
  return null;
}

export function updateDataRefWithIds(dataRef, ids) {
  dataRef.clear();
  _.map(ids, id => {
    dataRef.add(id);
  });
  dataRef.onUpdate(ids);
}
