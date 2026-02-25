
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- SYSTEM DIAGNOSTICS ---
console.log("%c MODUS OPERATING SYSTEM ", "background: #000; color: #fff; font-weight: bold; padding: 4px;");
console.log("Build Time:", new Date().toISOString());

// Safely access import.meta.env to prevent white-screen crashes if environment is not fully polyfilled
const envMode = (import.meta as any).env ? (import.meta as any).env.MODE : 'unknown/unbundled';
console.log("Environment:", envMode);

// Check connections (Boolean check only for security)
const checkEnv = (key: string, val: any) => 
  console.log(`${key}:`, val ? `%cCONNECTED (${val.toString().slice(0,5)}...)` : "%cMISSING", val ? "color:green" : "color:red");

checkEnv("Gemini API", process.env.GEMINI_API_KEY || process.env.API_KEY);
checkEnv("Supabase URL", process.env.VITE_SUPABASE_URL);
checkEnv("Supabase Key", process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
// --------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
