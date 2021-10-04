const { sendMessage } = require('./send-message');

function injectCode(code) {
  const script = document.createElement('script');
  script.textContent = code;

  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

function injectDebugger() {
  const injectedGlobal = 'window.__OVERREACT_DEVTOOLS__';

  chrome.devtools.inspectedWindow.eval(injectedGlobal, result => {
    if (!result) {
      const agentUrl = chrome.runtime.getURL('dist/agent.js');
      console.log(agentUrl);

      let agentCode;

      const request = new XMLHttpRequest();
      request.addEventListener('load', function () {
        agentCode = this.responseText;
      });

      request.open('GET', agentUrl, false);
      request.send();

      injectCode(agentCode);
    } else {
      sendMessage('connect');
    }
  });
}

module.exports = {
  injectDebugger,
};
