import React from 'react';
import ReactDOM from 'react-dom';
import { DevToolsUI } from './devtools-ui';

const { injectDebugger } = require('./inject-debugger');

injectDebugger();

window.addEventListener('load', () => {
  ReactDOM.render(<DevToolsUI />, document.getElementById('devtools-container'));
});
