import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext.jsx';

import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
        <UserProvider>
           <App/>
        </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
