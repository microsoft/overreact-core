import _ from 'underscore';

export function createErrorMiddleware(errorMiddlewareOptions) {
  const {
    errorProcessor = _.noop,
    errorConvertor: envErrorConverter = _.noop,
  } = errorMiddlewareOptions || {};
  return next => async req => {
    const {
      spec: {
        responseContract: {
          errorConvertFn,
        } = {},
      } = {},
    } = req || {};
    const errorConvertor = errorConvertFn || envErrorConverter;

    const response = next(req).then(res => {
      const error = errorConvertor(res);
      if (error) {
        throw error;
      }
      return res;
    }).catch(error => {
      const processedError = errorConvertor(error) || error;
      errorProcessor(processedError);
      throw error;
    });

    return response;
  };
}
