/* eslint-disable no-param-reassign */
import _ from 'underscore';

import { getTimestamp } from '../../utils/primitive-utilities';

const errorToString = error => {
  const stringError = error && error.toString();
  const stringifiedJson = JSON.stringify(error);

  if ((!_.isEmpty(stringifiedJson) && stringifiedJson !== '{}') || stringError === '[object Object]') {
    return stringifiedJson;
  }
  return stringError;
};

export const defaultStubOptions = {
  serverErrorCodes: [-1],

  detectError(respData, serverErrorCodes) {
    const result = {
      pass: true,
      status: 400, // hard code to 400 for user-defined error
    };

    if (respData
      && respData.Errors
      && respData.Errors[0]
      && respData.Errors[0].Code
      && _.isArray(serverErrorCodes)
      && _.contains(serverErrorCodes, respData.Errors[0].Code)) {
      result.pass = false;
      result.message = respData.Errors[0].Message;
      result.impactUser = true;
    }
    return result;
  },

  getServerPerf(response) {
    if (response && _.isFunction(response.getResponseHeader)) {
      const perfTimings = response.getResponseHeader('PerfTimings');
      if (perfTimings) {
        return perfTimings;
      }
      const perf = {};
      _.each(
        ['x-ms-mte2eelapsedtimems', 'x-ms-odataapie2eelapsedtimems', 'x-ms-odataapionlye2eelapsedtimems'],
        header => {
          const value = response.getResponseHeader(header);
          if (value) {
            perf[header] = value;
          }
        },
      );

      return JSON.stringify(perf);
    }
    return '';
  },
};

export function beforeSendHandler(instrumentationContext, req, perfFunc, shouldAddHeaders) {
  instrumentationContext.requestStartTime = getTimestamp();

  if (shouldAddHeaders(instrumentationContext) === true) {
    req.header = {
      ...req.header,
      'x-ms-pagetrackingid': instrumentationContext.pageTrackingId,
      'x-ms-lcid': instrumentationContext.stubOptions.lcid,
      lcid: instrumentationContext.stubOptions.lcid,
      'x-ms-requestid': instrumentationContext.requestId,
    };
  }

  perfFunc({
    requestId: instrumentationContext.requestId,
    api: instrumentationContext.url,
    isMethodEnter: true,
    httpMethod: instrumentationContext.httpMethod,
    timeTaken: 0,
    pass: true,
    message: '',
  });
}

export function successHandler(instrumentationContext, response, errorFunc, perfFunc) {
  const requestTimeTaken = getTimestamp() - instrumentationContext.requestStartTime;
  const result = instrumentationContext.stubOptions.detectError(response);
  instrumentationContext.requestTimeTaken = requestTimeTaken;

  if (!result.pass) {
    instrumentationContext.requestResult = false;
    instrumentationContext.error = result.message;

    errorFunc({
      message: instrumentationContext.error,
      api: instrumentationContext.url,
      requestId: instrumentationContext.requestId,
      impactUser: result.impactUser,
      httpMethod: instrumentationContext.httpMethod,
      statusCode: result.status,
    });
  }

  perfFunc({
    requestId: instrumentationContext.requestId,
    api: instrumentationContext.url,
    isMethodEnter: false,
    httpMethod: instrumentationContext.httpMethod,
    timeTaken: instrumentationContext.requestTimeTaken,
    pass: instrumentationContext.requestResult,
    message: instrumentationContext.stubOptions.getServerPerf(response),
    statusCode: 200,
  });
}

export function errorHandler(
  instrumentationContext, error, isUserError,
  traceFunc, errorFunc, perfFunc, mergedConfig,
) {
  const requestTimeTaken = getTimestamp() - instrumentationContext.requestStartTime;
  instrumentationContext.requestTimeTaken = requestTimeTaken;
  instrumentationContext.responseJSON = error.responseJSON;

  if (error.status !== 0 && error.status) {
    instrumentationContext.requestResult = false;

    instrumentationContext.error = `Overreact server response error: [${error.status}]`;

    if (error.textStatus && error.textStatus.trim() !== '') {
      instrumentationContext.error += (`, textStatus: ${error.textStatus}`);
    }
    if (error.responseText && error.responseText.trim() !== '') {
      instrumentationContext.error += (`, responseText: ${error.responseText}`);
    }
    if (error.responseXML && error.responseXML.trim() !== '') {
      instrumentationContext.error += (`, responseXML: ${error.responseXML}`);
    }
    if (error.responseJSON) {
      instrumentationContext.error += (`, responseJSON: ${errorToString(error.responseJSON)}`);
    }

    switch (error.status) {
      case 400:
      case 404:
        // If error maps to a user error, log at trace level
        if (isUserError(instrumentationContext)) {
          instrumentationContext.requestResult = true;
        }
        break;
      case 401:
        // Log 401 unauthorized error at trace level
        instrumentationContext.requestResult = true;
        break;
      default:
        instrumentationContext.requestResult = false;
    }
  } else {
    instrumentationContext.requestResult = false;
    const errMsg = _.isError(error) ? error : JSON.stringify(error);
    instrumentationContext.error = `Overreact general error: ${errMsg}`;
  }

  const logFunc = instrumentationContext.requestResult ? traceFunc : errorFunc;
  logFunc({
    message: instrumentationContext.error,
    api: instrumentationContext.url,
    requestId: instrumentationContext.requestId,
    httpMethod: instrumentationContext.httpMethod,
    statusCode: error.status,
  });

  perfFunc({
    requestId: instrumentationContext.requestId,
    api: instrumentationContext.url,
    isMethodEnter: false,
    httpMethod: instrumentationContext.httpMethod,
    timeTaken: instrumentationContext.requestTimeTaken,
    pass: instrumentationContext.requestResult,
    statusCode: error.status,
  });

  if (!_.isFunction(mergedConfig.onError)) {
    errorFunc({
      message: 'No error handling',
      api: instrumentationContext.url,
      requestId: instrumentationContext.requestId,
      httpMethod: instrumentationContext.httpMethod,
    });
  }
}
