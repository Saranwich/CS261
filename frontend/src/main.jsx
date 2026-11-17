import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './polish.css'
import './theme.css'
import './smooth.css'
import './refine.css'
import './extras.css'
import { initTheme } from './utils/theme'

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)