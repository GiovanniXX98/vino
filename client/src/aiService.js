import { GoogleGenerativeAI } from "@google/generative-ai";
import wineContext from "./data/wineContext.json";
import { GEMINI_API_KEY } from "./config";

// Inizializzazione del modello Gemini
// Cerchiamo la chiave in localStorage per sicurezza (non viene caricata su GitHub)
const getApiKey = () => localStorage.getItem('gemini_api_key') || GEMINI_API_KEY;

export async function callLLM(message) {
  const currentKey = getApiKey();
  
  if (!currentKey) {
    return "Ciao! Per attivare l'Esperto Enologo, clicca sull'icona ⚙️ nella chat e incolla la tua Gemini API Key.";
  }

  const genAI = new GoogleGenerativeAI(currentKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepariamo il contesto basato sui tuoi documenti (RAG)
    const contextString = wineContext.core_knowledge.map(k => {
      return `${k.topic}: ${k.summary || ""} ${k.links ? k.links.join(', ') : ""}`;
    }).join("\n");

    const systemInstruction = `
      Sei l'Esperto Enologo del Wine Quiz. La tua personalità è: ${wineContext.personality}.
      Hai a disposizione la seguente conoscenza specialistica estratta dai tuoi 40 documenti:
      ${contextString}

      REGOLE:
      1. Rispondi SEMPRE in italiano.
      2. Sii tecnico ma accessibile.
      3. Se non conosci la risposta, suggerisci di consultare i siti OIV o Vason citati nel contesto.
      4. Mantieni uno stile elegante e professionale.
    `;

    const result = await model.generateContent([systemInstruction, message]);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Errore Gemini API:", err);
    return "Spiacente, ho avuto un problema di connessione alla cantina dati. Verifica la tua API Key!";
  }
}
