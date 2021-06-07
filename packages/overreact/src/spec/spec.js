export function createSpec(
  requestContract,
  responseContract,
  specType,
  sideEffectFn,
  environmentLookupFn
) {
  // FIXME: only the basics. Need to create more based on specType
  return {
    requestContract,
    responseContract,
    specType,
    sideEffectFn,
    environmentLookupFn,
  };
}
