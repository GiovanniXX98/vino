import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { callLLM } from './aiService';
import { OLLAMA_IP } from './config';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Buongiorno! Sono il tuo Esperto Enologo (DeepSeek Local). Chiedimi ciò che vuoi sui tuoi documenti!' }
  ]); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      const errMsg = { role: 'assistant', text: 'Errore di connessione a Ollama. Verifica che sia attivo e ben configurato!' };
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
          <h4>Wine LLM (Local)</h4>
        </div>
        <button className="close-btn" onClick={onClose} title="Chiudi Chat">
          <X size={20} />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.role}`}>
            {msg.text.startsWith('CONN_ERROR: ') ? (
              <>
                {msg.text.replace('CONN_ERROR: ', '').split('https://')[0]}
                <a 
                  href={`https://${OLLAMA_IP}:11435`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--secondary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Sblocca Connessione HTTPS
                </a>
                {msg.text.split('11435')[1]}
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && (
          <div className="chatbot-message assistant" style={{ fontStyle: 'italic', opacity: 0.7 }}>
            L'enologo locale sta elaborando...
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
          placeholder="Chiedi all'esperto locale..."
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading} title="Invia">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
