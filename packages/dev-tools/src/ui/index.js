import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, initializeIcons } from '@fluentui/react';

import store from './store';

import { DevToolsUI } from './devtools-ui';

const { injectDebugger } = require('./inject-debugger');

initializeIcons();
injectDebugger();

window.addEventListener('load', () => {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <DevToolsUI />
      </ThemeProvider>
    </Provider>,
    document.getElementById('devtools-container'),
  );
});
