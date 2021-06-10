/* eslint-disable no-param-reassign */
import _ from 'underscore';
import { v4 as uuidv4 } from 'uuid';

import { InstrumentationContext } from './instrumentation-context';
import { beforeSendHandler, successHandler, errorHandler } from './instrumentation-utils';

export function createInstrumentationMiddleware(instrumentationOptions) {
  const {
    pageTrackingId,
    errorMappers,
    stubOptions,
    loggerFunc: {
      traceFunc = _.noop,
      errorFunc = _.noop,
      perfFunc = _.noop,
    } = {},
  } = instrumentationOptions || {};

  const shouldAddHeaders = instrumentationOptions.shouldAddHeaders || _.constant(true);

  function isUserError(instrumentationContext) {
    return _.any(errorMappers, errorMapper => errorMapper.check(instrumentationContext));
  }

  return next => async req => {
    const {
      header: {
        'x-ms-requestid': requestId = uuidv4(),
      } = {},
    } = req;

    const instrumentationContext = new InstrumentationContext({
      pageTrackingId,
      errorMappers,
      url: req.uri,
      requestId,
      httpMethod: req.spec.requestContract.verb,
      stubOptions,
    });

    beforeSendHandler(instrumentationContext, req, perfFunc, shouldAddHeaders);

    const response = next(req).then(res => {
      successHandler(instrumentationContext, res, errorFunc, perfFunc);
      return res;
    }).catch(error => {
      errorHandler(instrumentationContext, error, isUserError, traceFunc, errorFunc, perfFunc);
      throw error;
    });

    return response;
  };
}
