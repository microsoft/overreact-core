const { installHook } = require('./global_hook');

function injectCode(code) {
  const script = document.createElement('script');
  script.textContent = code;

  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

window.addEventListener('message', ({ data, source }) => {
  if (source !== window) {
    return;
  }

  if (typeof data !== 'object' || data === null
  || !data.source === 'overreact-devtools-extension') {
    return;
  }

  chrome.runtime.sendMessage(data);
});

if (document.contentType === 'text/html') {
  injectCode(
    `;(${
      installHook.toString()
    }(window))`,
  );
}
