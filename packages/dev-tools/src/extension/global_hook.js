/* eslint-disable prefer-template */

function installHook(target) {
  if (target.hasOwnProperty('__OVERREACT_DEVTOOLS__')) {
    return null;
  }

  function emit(data) {
    window.postMessage({
      payload: data,
      source: 'overreact-devtools-extensions',
    }, '*');
  }

  const hook = {
    emit,
  };

  Object.defineProperty(
    target,
    '__OVERREACT_DEVTOOLS__',
    ({
      enumerable: false,
      get() {
        return hook;
      },
    }),
  );

  return hook;
}

module.exports = {
  installHook,
};
