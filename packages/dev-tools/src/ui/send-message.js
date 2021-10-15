const port = require('./port');

function sendMessage(name, data) {
  port.postMessage({
    name,
    tabId: chrome.devtools.inspectedWindow.tabId,
    data: data || {},
  });
}

module.exports = {
  sendMessage,
};
