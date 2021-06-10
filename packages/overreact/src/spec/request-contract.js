export class RequestContract {
  constructor({
    schema,
    dataPath,
    verb,
    fetchPolicy,
    uriFactoryFn,
    headerFactoryFn,
    payloadFactoryFn,
    keySelector,
    parentKeySelector,
  }) {
    this.schema = schema;
    this.dataPath = dataPath;
    this.verb = verb;
    this.fetchPolicy = fetchPolicy;
    this.uriFactoryFn = uriFactoryFn;
    this.headerFactoryFn = headerFactoryFn;
    this.payloadFactoryFn = payloadFactoryFn;
    this.keySelector = keySelector;
    this.parentKeySelector = parentKeySelector;

    this.getSchemaNode = this.getSchemaNode.bind(this);
  }

  getSchemaNode() {
    // schema is the root of the schema tree that current app has built
    // need to either find an existing path in the tree,
    // or construct a new path in the tree

    // note that the schema tree is only a sub-tree (or more precisely a sub-graph)
    // of the original data schema, such as one found in OData.
    return this.schema.insert(this.dataPath);
  }
}

export function createRequestContract({
  schema,
  dataPath,
  verb,
  fetchPolicy,
  uriFactoryFn,
  headerFactoryFn,
  payloadFactoryFn,
  keySelector,
  parentKeySelector,
}) {
  if (!dataPath) {
    throw new Error('dataPath cannot be empty');
  }

  return new RequestContract({
    schema,
    dataPath,
    verb,
    fetchPolicy,
    uriFactoryFn,
    headerFactoryFn,
    payloadFactoryFn,
    keySelector,
    parentKeySelector,
  });
}
