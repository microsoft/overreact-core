import { FetchPolicy } from '@microsoft/overreact';

export const networkPolicy = FetchPolicy.StoreOrNetwork;

export function urlDecorator(fn) {
  function decorator(params, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return params => decorator(params, fn(params));
}

export function headerDecorator(fn) {
  function decorator(params, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return params => decorator(params, fn(params));
}

export function payloadDecorator(fn) {
  function decorator(params, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return params => decorator(params, fn(params));
}

export function processorDecorator(fn) {
  function decorator(response, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return response => decorator(response, fn(response));
}
