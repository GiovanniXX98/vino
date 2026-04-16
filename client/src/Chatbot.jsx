import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Settings } from 'lucide-react';
import { callLLM } from './aiService';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Buongiorno! Sono il tuo Esperto Enologo. Come posso aiutarti oggi con il mondo dei vini?' }
  ]); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', tempApiKey);
    setShowSettings(false);
    alert('API Key salvata correttamente nel browser!');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await callLLM(input.trim());
      const botMsg = { role: 'assistant', text: reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg = { role: 'assistant', text: 'Spiacente, ho avuto un problema tecnico. Verifica la tua API Key!' };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-panel" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="chatbot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: loading ? '#f2ce5a' : '#4CAF50', borderRadius: '50%' }}></div>
          <h4>Wine NotebookLM</h4>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} title="Impostazioni API">
            <Settings size={20} />
          </button>
          <button className="close-btn" onClick={onClose} title="Chiudi Chat">
            <X size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <label>Google Gemini API Key:</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            <input 
              type="password" 
              value={tempApiKey} 
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Incolla qui la chiave..."
            />
            <button className="save-btn" onClick={saveApiKey}>Salva</button>
          </div>
          <small>La chiave viene salvata solo nel tuo browser.</small>
        </div>
      )}

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chatbot-message assistant" style={{ fontStyle: 'italic', opacity: 0.7 }}>
            L'enologo sta analizzando i documenti...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Scrivi qui il tuo messaggio..."
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading} title="Invia">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
