// Simple AI service wrapper using HuggingFace Inference API (no API key required for public models)
// You can replace the endpoint with another free LLM service if desired.

export async function callLLM(message) {
  const endpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
  
  // Customizing the prompt to act as an expert (NotebookLM style)
  const systematicPrompt = `Sei un esperto enologo del Wine Quiz. Rispondi in modo professionale e cordiale in italiano. 
Utente: ${message}
Enologo:`;

  const payload = {
    inputs: systematicPrompt,
    parameters: { max_new_tokens: 150, temperature: 0.7, return_full_text: false }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Servizio AI momentaneamente non disponibile.');

    const data = await response.json();
    let text = "";
    
    if (Array.isArray(data) && data.length > 0) {
      text = data[0].generated_text || data[0];
    } else {
      text = data.generated_text || JSON.stringify(data);
    }
    
    return text.trim() || "Non ho capito bene, puoi ripetere?";
  } catch (err) {
    console.error(err);
    return "Spiacente, l'esperto è al momento in cantina. Riprova più tardi!";
  }
}
