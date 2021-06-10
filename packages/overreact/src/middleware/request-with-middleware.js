import {
  compose, omit, values, pick,
} from 'underscore';
import { middlewareTypes } from './middleware-types';

function executeRequestor(wrappedRequestor) {
  return wrappedRequestor.executeRequest();
}

export function requestWithMiddleware(wrappedRequestor, middlewares) {
  const baseMiddlewares = values(omit(middlewares, middlewareTypes.INSTRUMENTATION));
  const instrumentationMiddleware = values(pick(middlewares, middlewareTypes.INSTRUMENTATION));
  const wrappedRequest = compose(
    ...baseMiddlewares,
    ...instrumentationMiddleware,
  )(executeRequestor);

  // eslint-disable-next-line arrow-body-style
  return wrappedRequest(wrappedRequestor).then(response => {
    return response;
  }).catch(error => {
    throw error;
  });
}
