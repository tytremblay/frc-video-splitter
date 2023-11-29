import React from 'react';
import ReactDOM from 'react-dom/client';
import { Splitter } from './Splitter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Splitter />
  </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');
