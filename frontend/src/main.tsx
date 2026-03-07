import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Importamos o BrowserRouter
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {/* Envelopamos o App com o BrowserRouter */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)