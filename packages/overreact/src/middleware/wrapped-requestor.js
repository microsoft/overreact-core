export class WrappedRequestor {
  constructor(parameter) {
    const {
      requestor,
      uri,
      verb,
      headers,
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
    this.headers = headers;
    this.payload = payload;
    this.variables = variables;
    this.spec = spec;
    this.store = store;
    this.dataRefId = dataRefId;
    this.middlewareStates = middlewareStates;

    this.executeRequest = this.executeRequest.bind(this);
  }

  executeRequest() {
    return this.requestor(this.uri, this.verb, this.headers, this.payload);
  }
}
