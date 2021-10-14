import 'regenerator-runtime/runtime';

import { requestWithMiddleware, WrappedRequestor } from '../middleware';

export class Environment {
  constructor(networkRequestor, schema, store, middlewares, tag) {
    this.networkRequestor = networkRequestor;

    this.schema = schema;

    // an FIFO queue
    this.requestQueue = [];
    this.dataFetcherSubscriber = [];

    // initialize the store
    this.store = store;

    this.middlewares = middlewares || {};

    this.tag = tag;

    this.notifyObservers = this.notifyObservers.bind(this);
    this.pushRequest = this.pushRequest.bind(this);
    this.removeRequest = this.removeRequest.bind(this);
    this.requestCount = this.requestCount.bind(this);

    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);

    this.getSchema = this.getSchema.bind(this);
    this.getRequestor = this.getRequestor.bind(this);

    this.dataRefIdPool = {};
  }

  getRequestor(id, spec, variables, middlewareStates, additionalParams) {
    const requestorWithDevTools = (uri, verb, headers, payload) => {
      const requestor = this.networkRequestor(uri, verb, headers, payload);

      if (window.__OVERREACT_DEVTOOLS__) {
        const { onRequest, onError } = window.__OVERREACT_DEVTOOLS__;
        const { componentName } = additionalParams;
        return requestor
          .then(value => {
            onRequest({
              id,
              uri,
              verb,
              headers,
              payload,
              spec: spec.toString(),
              componentName,
              responseValue: value,
            });
            return value;
          })
          .catch(ex => {
            onError({
              id,
              uri,
              verb,
              headers,
              payload,
              spec: spec.toString(),
              componentName,
              exception: ex,
            });

            throw ex;
          });
      }

      return this.networkRequestor(uri, verb, headers, payload);
    };

    return (uri, verb, headers, payload) => ({
      execute: sink => {
        if (!this.middlewares || this.middlewares.length === 0) {
          requestorWithDevTools(uri, verb, headers, payload)
            .then(value => sink.onComplete(value))
            .catch(err => sink.onError(err));
        } else {
          const wrappedRequestor = new WrappedRequestor({
            requestor: requestorWithDevTools,
            uri,
            verb,
            headers,
            payload,
            spec,
            variables,
            store: this.store,
            dataRefId: id,
            middlewareStates,
          });
          const res = requestWithMiddleware(wrappedRequestor, this.middlewares);

          res
            .then(value => sink.onComplete(value))
            .catch(err => sink.onError(err));
        }
      },
    });
  }

  getSchema() {
    return this.schema;
  }

  notifyObservers() {
    for (let i = 0; i < this.dataFetcherSubscriber.length; i += 1) {
      this.dataFetcherSubscriber[i].notify(this.requestQueue);
    }
  }

  /*
    The request will have the following shape:

    {
      id,
      requestContract,
      spec,
      variables,
      data,
      dataCb,
    }
  */
  pushRequest(request) {
    this.requestQueue.push(request);

    this.notifyObservers();
  }

  removeRequest() {
    return this.requestQueue.shift();
  }

  requestCount() {
    return this.requestQueue.length;
  }

  subscribe(notifyCb) {
    this.dataFetcherSubscriber.push({
      notify: notifyCb,
    });

    return this.dataFetcherSubscriber.length - 1;
  }

  unsubscribe(id) {
    return this.dataFetcherSubscriber.splice(id, 1).length;
  }
}
