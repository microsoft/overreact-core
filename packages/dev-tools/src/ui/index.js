import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import store from './store';

import { DevToolsUI } from './devtools-ui';

const { injectDebugger } = require('./inject-debugger');

injectDebugger();

window.addEventListener('load', () => {
  ReactDOM.render(
    <Provider store={store}>
      <DevToolsUI />
    </Provider>,
    document.getElementById('devtools-container'),
  );
});
