import wineContext from "./data/wineContext.json";
import { OLLAMA_BASE_URL, OLLAMA_IP } from "./config";

// Configurazione Ollama Dinamica
const MODEL_NAME = "wine-expert";

export async function callLLM(message) {
  try {
    const contextString = wineContext.core_knowledge.map(k => {
      return `${k.topic}: ${k.summary || ""}`;
    }).join("\n");

    const documentContext = wineContext.document_context || "";

    const prompt = `
      SISTEMA: Sei l'Enologo Senior. Rispondi in italiano in modo estremamente sintetico e tecnico.
      CONTESTO: ${documentContext} ${contextString}
      DOMANDA: ${message}
      RISPOSTA BREVE:
    `;

    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama Error Detail: Status ${response.status}, Body: ${errorText}`);
      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH_ERROR');
      }
      throw new Error(`Errore Server (${response.status})`);
    }

    const data = await response.json();
    let reply = data.response;

    // Rimuove il ragionamento interno se presente
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Fallback se la risposta è vuota
    if (!reply) {
      return "Buongiorno. Sono l'Enologo Senior, come posso aiutarla con i suoi quesiti tecnici?";
    }

    return reply;
  } catch (err) {
    console.error("Dettaglio Errore:", err);
    if (err.message === 'AUTH_ERROR') {
      return `AUTH_ERROR: Il bot non è autorizzato ad accedere al server. Contatta l'amministratore.`;
    }
    return `CONN_ERROR: Il bot non riesce a connettersi al server AI. Il servizio potrebbe essere offline o richiedere una configurazione speciale.||HTTPS_LINK:https://${OLLAMA_IP}:11435`;
  }
}
