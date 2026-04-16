# Implementation Plan

## Goal Description
We need to:
1. Ensure the full‑screen logo overlay is perfectly centered.
2. Add a **LLM button** below the logo that opens a simple chatbot UI.
3. Implement a lightweight chatbot component that sends user messages to a free LLM endpoint (e.g., HuggingFace inference API) and displays the response.
4. Keep the existing quiz functionality unchanged.

## User Review Required
> [!IMPORTANT]
> Choose the free LLM service you prefer:
> - **HuggingFace Inference API** (no key required for many public models, rate‑limited).
> - **OpenAI ChatGPT free tier** (requires an API key).
> - **Ollama local model** (requires the user to run Ollama locally).
>
> Let us know which one to use and any API key you want to provide (if needed).

## Proposed Changes
---
### Frontend (client)
- **src/index.css** – adjust `.logo-overlay` and `.logo-circle` to guarantee centering.
- **src/Quiz.jsx** – add a button `<button className="btn llm-btn" onClick={openChat}>Chat with AI</button>` after the logo overlay.
- **src/Chatbot.jsx** – new component handling message input, displaying a conversation list, and calling the selected LLM endpoint.
- **src/App.jsx** (or main wrapper) – import and render `<Chatbot />` conditionally when `showChat` state is true.
- Add minimal styling for the chatbot UI (floating panel, responsive).
---
### API Integration
- Create **src/aiService.js** exposing a function `callLLM(message)` that performs a `fetch` POST to the chosen endpoint.
- For HuggingFace, use `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1` with appropriate headers.
- Handle CORS via the browser (HuggingFace supports it). Provide fallback error handling.
---
### State Management
- Add a new state `showChat` in `Quiz.jsx` (or a higher‑level component) to toggle the chatbot panel.
- Store conversation in local component state; optionally persist in `localStorage`.
---
## Open Questions
- Which free LLM service should we target?
- Do you want the chatbot to appear as a modal overlay or a side panel?
- Any design preferences for the chatbot UI (colors, size)?

## Verification Plan
### Automated Tests
- Run `npm run build` to ensure no compile errors.
- Use the browser tool to open the site, click the logo, then the LLM button, send a message and verify a response appears.
### Manual Verification
- Verify the logo overlay is centered on desktop and mobile.
- Confirm the chatbot UI is responsive and functional.
