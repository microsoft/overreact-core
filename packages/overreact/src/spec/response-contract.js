/* eslint-disable no-console */
/* eslint-disable max-len */
import { OVERREACT_ID_FIELD_NAME, createOverreactId } from '../store/consts';
import { specTypes } from './spec-types';

import fetchResponseHandler from './response-handler/fetch';
import mutationResponseHandler from './response-handler/mutation';
import refetchResponseHandler from './response-handler/refetch';
import errorResponseHandler from './response-handler/error';

export class ResponseContract {
  constructor({
    requestContract, responseType, keySelector, processorFn, errorConvertFn,
  }) {
    this.requestContract = requestContract;
    this.responseType = responseType;
    this.keySelector = keySelector;
    this.processorFn = processorFn;
    this.errorConvertFn = errorConvertFn;
    this.schemaNode = this.requestContract.getSchemaNode();

    this.selectKey = this.selectKey.bind(this);
    this.onGetResponse = this.onGetResponse.bind(this);
    this.onGetError = this.onGetError.bind(this);

    this.applyId = this.applyId.bind(this);
  }

  selectKey(variables) {
    return this.keySelector(variables);
  }

  applyId(entity, parentId) {
    // create a new OVERREACT_ID_FIELD in the entity object,
    // to uniquely identify a record.
    // Basically we'll append the entity's parent type and ID
    // to the ID of the entity itself, which will comes handy
    // during the clean-up if the parent entity is deleted.

    const overreactId = createOverreactId(
      this.keySelector(entity),
      parentId,
      this.schemaNode.parentNode.name
    );

    return {
      ...entity,
      [OVERREACT_ID_FIELD_NAME]: overreactId,
    };
  }

  onGetResponse(environment, response, request) {
    let processedResponse = response;
    const { spec } = request;
    const { specType } = spec;

    if (!request.middlewareStates.isResponseFromStore && this.processorFn) {
      processedResponse = this.processorFn(response, request);
    }

    switch (specType) {
      case specTypes.FETCH:
      case specTypes.PAGINATION: {
        return fetchResponseHandler(environment, processedResponse, request)(this);
      }
      case specTypes.ADD:
      case specTypes.DELETE:
      case specTypes.MUTATION: {
        return mutationResponseHandler(environment, processedResponse, request)(this);
      }
      case specTypes.REFETCH: {
        return refetchResponseHandler(environment, processedResponse, request)(this);
      }
      default:
        return null;
    }
  }

  onGetError(environment, request, error) {
    return errorResponseHandler(environment, request, error)(this);
  }
}

export function createResponseContract({
  requestContract,
  responseType,
  keySelector,
  processorFn,
  errorConvertFn,
}) {
  return new ResponseContract({
    requestContract, responseType, keySelector, processorFn, errorConvertFn,
  });
}
