import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { MotionProvider } from './lib/motion-fix'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/portfolio-website">
      <MotionProvider>        <App />
      </MotionProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
