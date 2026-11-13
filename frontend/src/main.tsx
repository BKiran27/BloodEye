import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Use HashRouter on GitHub Pages to prevent 404s on subpath reloads
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') || 
  window.location.protocol === 'file:'
);
const Router = isGitHubPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
