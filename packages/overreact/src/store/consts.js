export const OVERREACT_ID_FIELD_NAME = '_OVERREACT_ID';

export function createOverreactId(id, parentId, parentType) {
  return `${parentType}:${parentId}:${id}`;
}
