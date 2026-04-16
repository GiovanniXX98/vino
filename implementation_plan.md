# Implementation Plan - UI Polish & AI Integration

## Goal Description
The user reported that the logo is not centered and the LLM is not "integrated". We need to:
1.  **Perfect Centering**: Revise the `logo-overlay` CSS to ensure absolute centering on all devices and add visual depth to make the centering obvious.
2.  **AI Integration (NotebookLM-style)**: 
    *   Enhance the chatbot to have a "Wine Expert" personality (mimicking a NotebookLM specialized in wine).
    *   Ensure the LLM button is clearly visible and functional.
    *   Add a greeting message from the AI when the chat opens.
    *   Improve the error handling in `aiService.js` to provide better feedback if the API is down.

## User Review Required
> [!IMPORTANT]
> - The centering issue might be a visual perception problem due to the pure white background. I will add a subtle gradient and a shadow to the logo to make it clearly "float" in the center.
> - For "NotebookLM integration", I will prompt the AI to act specifically as your personal Wine Assistant.

## Proposed Changes

### 🎨 CSS Enhancements (`client/src/index.css`)
- [MODIFY] `.logo-overlay`: Change background to a subtle radial gradient.
- [MODIFY] `.logo-circle`: Add a soft shadow to make it visible against white.
- [NEW] `.chatbot-message.assistant`: Style it differently (e.g., wine-colored accents) to feel more "integrated" with the brand.

### 🤖 AI Integration (`client/src/aiService.js` & `client/src/Chatbot.jsx`)
- [MODIFY] `aiService.js`: Update the model or improve the prompt to ensure it's "Wine Focused".
- [MODIFY] `Chatbot.jsx`: Add an initial state with a "Welcome" message from the "Wine Expert".

### 🧩 UI Logic (`client/src/Quiz.jsx`)
- [MODIFY] Overlay structure: Ensure the logo and button are in a well-defined flex container with zero margins on sides.

## Open Questions
- Is the logo "not centered" vertically or horizontally? (I will assume both and fix with a fresh flexbox approach).
- Do you have a specific AI model you want to use? (I'll stick to a free Mistral/Gemini-style API unless specified).

## Verification Plan
1.  **Manual Verification**: 
    *   Open the app on mobile and desktop. Check if the logo is dead center.
    *   Click "Chat with AI". Check if the AI greets the user.
    *   Ask a wine question to verify the "NotebookLM" expert persona.
2.  **Build Check**: Run `npm run build` to ensure no regressions.
