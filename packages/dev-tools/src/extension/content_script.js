function injectCode(code) {
  const script = document.createElement('script');
  script.textContent = code;

  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

function initializeAgent(target) {
  Object.defineProperty(
    target,
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

window.addEventListener('message', event => {
  // Only accept messages from same frame
  if (event.source !== window) {
    return;
  }

  const message = event.data;

  // Only accept messages of correct format (our messages)
  if (typeof message !== 'object' || message === null
      || message.source !== 'overreact-devtools-agent') {
    return;
  }

  chrome.runtime.sendMessage(message);
});

/*
 * agent <- **content-script.js** <- background.js <- dev tools
 */
chrome.runtime.onMessage.addListener(request => {
  request.source = 'overreact-devtools';
  window.postMessage(request, '*');
});

if (document.contentType === 'text/html') {
  injectCode(
    `;(${
      initializeAgent.toString()
    }(window))`,
  );
}
