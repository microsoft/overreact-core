function initializeAgent() {
  console.log('initializing agent');

  Object.defineProperty(
    window,
    '__OVERREACT_DEVTOOLS__',
    ({
      configurable: true,
      enumerable: false,
      get() {
        return {
          test: () => { console.log('test'); },
        };
      },
    }),
  );
}

initializeAgent();
