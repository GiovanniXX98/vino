import wineContext from "./data/wineContext.json";

// Configurazione Ollama Locale (usiamo /api/generate per massima compatibilità)
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL_NAME = "deepseek-r1:1.5b";

export async function callLLM(message) {
  try {
    const contextString = wineContext.core_knowledge.map(k => {
      return `${k.topic}: ${k.summary || ""}`;
    }).join("\n");

    const documentContext = wineContext.document_context || "";

    // Costruiamo un prompt unico per /api/generate
    const prompt = `
      ISTRUZIONI DI SISTEMA:
      Sei l'Esperto Enologo del Wine Quiz. Rispondi in italiano professionale e conciso.
      Usa questa conoscenza: ${documentContext} ${contextString}
      
      DOMANDA UTENTE: ${message}
      
      RISPOSTA DELL'ESPERTO ENOLOGO:
    `;

    const response = await fetch(OLLAMA_URL, {
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
      throw new Error(`Ollama Error: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.response; // Per /api/generate il campo è 'response'

    // Pulizia tag <think>
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return reply;
  } catch (err) {
    console.error("Errore Ollama:", err);
    return "Connessione a Ollama fallita. Controlla che OLLAMA_ORIGINS sia configurato!";
  }
}
