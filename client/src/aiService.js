import wineContext from "./data/wineContext.json";

// Configurazione Ollama Locale
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "deepseek-r1:1.5b";

export async function callLLM(message) {
  try {
    // Prepariamo il contesto basato sui tuoi documenti (RAG)
    const contextString = wineContext.core_knowledge.map(k => {
      return `${k.topic}: ${k.summary || ""} ${k.links ? k.links.join(', ') : ""}`;
    }).join("\n");

    const documentContext = wineContext.document_context || "";

    const systemInstruction = `
      Sei l'Esperto Enologo del Wine Quiz, un assistente specializzato locale. 
      La tua personalità è: ${wineContext.personality}.

      CONOSCENZA RAG:
      ${documentContext}

      SINTESI CORE:
      ${contextString}

      REGOLE:
      1. Rispondi in italiano professionale.
      2. Usa i dati tecnici forniti.
      3. Mantieni le risposte concise e precise.
    `;

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.message.content;

    // Pulizia eventuale del tag <think> tipico di DeepSeek R1
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return reply;
  } catch (err) {
    console.error("Errore Ollama:", err);
    return "Non riesco a connettermi a Ollama. Assicurati che sia attivo sul tuo PC con OLLAMA_ORIGINS configurato!";
  }
}
