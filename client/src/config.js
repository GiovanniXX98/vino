// Configurazione globale per l'applicazione

// Indirizzo IP locale del server (Proxy HTTPS)
export const SERVER_IP = "157.27.128.25";

// Ollama (Proxy su porta 11435)
export const OLLAMA_IP = SERVER_IP;
export const OLLAMA_BASE_URL = `https://${OLLAMA_IP}:11435/api/generate`;

// Backend Node.js
// Se siamo su HTTPS (es. GitHub Pages), dobbiamo usare il proxy HTTPS su porta 3001
// Se siamo su HTTP (es. locale), possiamo usare direttamente la porta 3000
const isHttps = window.location.protocol === 'https:';
export const API_BASE_URL = isHttps
  ? `https://${SERVER_IP}:3001/api`
  : `http://localhost:3000/api`;
