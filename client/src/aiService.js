import wineContext from "./data/wineContext.json";
import { OLLAMA_BASE_URL } from "./config";

// Configurazione Ollama Dinamica
const MODEL_NAME = "wine-expert";

export async function callLLM(message) {
  try {
    const contextString = wineContext.core_knowledge.map(k => {
      return `${k.topic}: ${k.summary || ""}`;
    }).join("\n");

    const documentContext = wineContext.document_context || "";

    const prompt = `
      SISTEMA: Sei l'Esperto Enologo. Rispondi in italiano.
      CONTESTO: ${documentContext} ${contextString}
      DOMANDA: ${message}
      RISPOSTA:
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
      throw new Error(`Errore Server (${response.status})`);
    }

    const data = await response.json();
    let reply = data.response;

    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return reply;
  } catch (err) {
    console.error("Dettaglio Errore:", err);
    return `CONN_ERROR: Per abilitare la connessione sicura (HTTPS), clicca qui: https://${OLLAMA_IP}:11435 e seleziona "Avanzate" -> "Procedi". Torna poi qui e riprova!`;
  }
}
