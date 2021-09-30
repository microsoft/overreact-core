let currentPanel = null;

function renderDevToolsPanel() {
  const root = createRoot();
}

chrome.devtools.panels.create('overreact', '', './pages/main.html', extensionPanel => {
  extensionPanel.onShown.addListener(panel => {
    if (currentPanel === panel) {
      return;
    }

    currentPanel = panel;

    renderDevToolsPanel();
  });
});

const backgroundConnection = chrome.runtime.connect({
  name: 'overreact-devtools',
});

backgroundConnection.onMessage.addListener(message => {

});

backgroundConnection.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: 'content_script.js',
});
