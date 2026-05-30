import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider';
document.title = import.meta.env.VITE_APP_NAME;
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </ThemeProvider>
)
