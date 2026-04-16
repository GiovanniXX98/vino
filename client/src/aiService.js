// Simple AI service wrapper using HuggingFace Inference API (no API key required for public models)
// You can replace the endpoint with another free LLM service if desired.

export async function callLLM(message) {
  const endpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
  const payload = {
    inputs: message,
    parameters: { max_new_tokens: 150, temperature: 0.7 }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // If you have a HuggingFace API token, add it here:
      // Authorization: 'Bearer YOUR_HF_TOKEN'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  // The API returns an array of generated texts
  if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
    return data[0].generated_text.trim();
  }
  // Fallback for other response shapes
  return typeof data === 'string' ? data.trim() : JSON.stringify(data);
}
