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

export function keySelectorDecorator(fn) {
  function decorator(obj, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return obj => decorator(obj, fn(obj));
}

export function processorDecorator(fn) {
  function decorator(response, request, originValue) {
    // TODO: Add decoration
    return originValue;
  }

  return (response, request) => decorator(response, request, fn(response, request));
}

export const sideEffects = {
  fetch: null,
  refetch: null,
  mutation: null,
  pagination: null,
  add: null,
  destroy: null,
};
