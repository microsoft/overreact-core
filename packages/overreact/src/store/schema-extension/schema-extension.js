import { DataNode } from './data-node';

const EXTENSION_NAME = 'DATA';

export function createDataNode(schemaNode, store) {
  if (!schemaNode) {
    throw new Error('Invalid schema node');
  }

  const dataNode = new DataNode();
  store.getRecordGroup(schemaNode.modelName).subscribe(dataNode);

  schemaNode.setExtension(EXTENSION_NAME, dataNode);

  return dataNode;
}

export function getDataNode(schemaNode) {
  if (!schemaNode) {
    return null;
  }

  return schemaNode.getExtension(EXTENSION_NAME);
}
