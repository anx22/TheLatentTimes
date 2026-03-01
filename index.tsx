
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// --- SYSTEM DIAGNOSTICS ---
console.log("%c THE LATENT TIMES OPERATING SYSTEM ", "background: #000; color: #fff; font-weight: bold; padding: 4px;");
console.log("Build Time:", new Date().toISOString());

// Safely access import.meta.env to prevent white-screen crashes if environment is not fully polyfilled
const envMode = (import.meta as any).env ? (import.meta as any).env.MODE : 'unknown/unbundled';
console.log("Environment:", envMode);

// Check connections (Boolean check only for security)
const checkEnv = (key: string, val: any) => 
  console.log(`${key}:`, val ? `%cCONNECTED` : "%cMISSING", val ? "color:green" : "color:red");

checkEnv("Gemini API", process.env.GEMINI_API_KEY || process.env.API_KEY);
checkEnv("Convex URL", import.meta.env.VITE_CONVEX_URL);
// --------------------------

let convexUrl = import.meta.env.VITE_CONVEX_URL;

// Auto-correct if the user accidentally provided the HTTP Actions URL (.convex.site) 
// instead of the Deployment URL (.convex.cloud) required for WebSockets.
if (convexUrl && convexUrl.includes('.convex.site')) {
  convexUrl = convexUrl.replace('.convex.site', '.convex.cloud');
  console.warn("Corrected Convex URL from .site to .cloud for WebSocket connectivity.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (!convexUrl) {
  console.error("VITE_CONVEX_URL is not defined.");
  root.render(
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-mono">
      <div className="max-w-md space-y-6 border border-red-900/50 bg-red-950/10 p-8 rounded-lg">
        <h1 className="text-xl font-bold text-red-500">System Configuration Error</h1>
        <p className="text-sm text-zinc-400">
          The application requires a Convex backend to function, but the connection URL is missing.
        </p>
        <div className="bg-black/50 p-4 rounded border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Missing Environment Variable:</p>
          <code className="text-emerald-400">VITE_CONVEX_URL</code>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">To fix this:</p>
          <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
            <li>Create a project at <a href="https://convex.dev" target="_blank" className="underline hover:text-white">convex.dev</a></li>
            <li>Get your deployment URL</li>
            <li>Add it to your environment variables</li>
          </ol>
        </div>
      </div>
    </div>
  );
} else {
  const convex = new ConvexReactClient(convexUrl, {
    skipConvexDeploymentUrlCheck: true, // Allow .convex.site URLs if necessary, though .convex.cloud is preferred
  });
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </React.StrictMode>
  );
}
