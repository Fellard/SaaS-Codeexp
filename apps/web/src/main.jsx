import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { registerSW } from '@/hooks/usePWA';

// Active le Service Worker pour le mode offline et l'installation PWA
registerSW();

ReactDOM.createRoot(document.getElementById('root')).render(
	<App />
);