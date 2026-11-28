import { createRoot } from 'react-dom/client'
import { injectSpeedInsights } from '@vercel/speed-insights'
import './index.css'
import App from './app.tsx'

injectSpeedInsights()

createRoot(document.getElementById('root')!).render(
    <App />
)
