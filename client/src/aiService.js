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

    const documentContext = wineContext.document_context || "";

    const systemInstruction = `
      Sei l'Esperto Enologo del Wine Quiz, un assistente specializzato (NotebookLM style). 
      La tua personalità è: ${wineContext.personality}.

      DOCUMENTI DI RIFERIMENTO (CONOSCENZA RAG):
      ${documentContext}

      SINTESI CONOSCENZA CORE:
      ${contextString}

      REGOLE DI RISPOSTA:
      1. Rispondi SEMPRE in italiano professionale e cordiale.
      2. Se la domanda riguarda temi presenti nei DOCUMENTI DI RIFERIMENTO, usa quelle informazioni con precisione tecnica.
      3. Se non conosci la risposta nei documenti, dillo chiaramente e suggerisci i link di riferimento.
      4. Mantieni uno stile da consulente enologico di alto livello.
    `;

    const result = await model.generateContent([systemInstruction, message]);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Errore Gemini API:", err);
    return "Spiacente, ho avuto un problema di connessione alla cantina dati. Verifica la tua API Key!";
  }
}
