const connections = {};

chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
  return true;
});

chrome.runtime.onConnect.addListener(port => {
  // assign the listener function to a variable so we can remove it later
  const devToolsListener = (message, sender, sendResponse) => {
    if (message.name === 'init') {
      connections[message.tabId] = port;
      return;
    }

    chrome.tabs.sendMessage(message.tabId, {
      name: message.name,
      data: message.data,
    });
  };

  // add the listener
  port.onMessage.addListener(devToolsListener);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(devToolsListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i += 1) {
      if (connections[tabs[i]] === port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});
