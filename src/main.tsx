import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './components/ui/theme-provider';
// Only override the static <title> from index.html when an app name is set,
// otherwise the title would become the literal string "undefined" (bad for SEO).
if (import.meta.env.VITE_APP_NAME) {
  document.title = import.meta.env.VITE_APP_NAME;
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </ThemeProvider>
)
