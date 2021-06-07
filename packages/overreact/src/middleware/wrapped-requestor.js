export class WrappedRequestor {
  constructor(parameter) {
    const {
      requestor,
      uri,
      verb,
      header,
      payload,
      spec,
      variables,
      store,
      dataRefId,
      middlewareStates,
    } = parameter;

    this.requestor = requestor;
    this.uri = uri;
    this.verb = verb;
    this.header = header;
    this.payload = payload;
    this.variables = variables;
    this.spec = spec;
    this.store = store;
    this.dataRefId = dataRefId;
    this.middlewareStates = middlewareStates;

    this.executeRequest = this.executeRequest.bind(this);
  }

  executeRequest() {
    return this.requestor(this.uri, this.verb, this.header, this.payload);
  }
}
