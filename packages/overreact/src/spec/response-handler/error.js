import _ from 'underscore';

import { getDataNode, createDataNode } from '../../store';

export default function handler(environment, request, error) {
  return (context) => {
    const { id: dataRefId, errorCb } = request;

    const { store } = environment;

    let dataNode = getDataNode(context.schemaNode);

    if (!dataNode) {
      dataNode = createDataNode(context.schemaNode, store);
    }

    const dataRef = dataNode.getDataRef(dataRefId);
    dataRef.onError(error, request);

    if (_.isFunction(errorCb)) {
      errorCb(error, request);
    }
  };
}
