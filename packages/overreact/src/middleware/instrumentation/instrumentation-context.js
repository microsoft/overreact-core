import _ from 'underscore';

import { defaultStubOptions } from './instrumentation-utils';

export class InstrumentationContext {
  constructor(parameter) {
    const {
      pageTrackingId,
      errorMappers,
      url,
      requestId,
      httpMethod,
      stubOptions,
    } = parameter;

    this.pageTrackingId = pageTrackingId;
    this.errorMappers = errorMappers;
    this.url = url;
    this.requestId = requestId;
    this.httpMethod = httpMethod;
    this.stubOptions = _.defaults(stubOptions || {}, defaultStubOptions);
  }
}
