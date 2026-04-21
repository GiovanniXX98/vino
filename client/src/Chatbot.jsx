import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { callLLM } from './aiService';
import { OLLAMA_IP } from './config';

const ConnectionErrorMessage = ({ text, ollamaIp }) => {
  const parts = text.split('||');
  const mainMessage = parts[0].replace('CONN_ERROR:', '').trim();
  const httpsLink = parts.find(p => p.startsWith('HTTPS_LINK:'))?.replace('HTTPS_LINK:', '');
  const email = parts.find(p => p.startsWith('EMAIL:'))?.replace('EMAIL:', '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p>{mainMessage}</p>
      {httpsLink && (
        <a 
          href={httpsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="error-link"
          style={{ 
            display: 'inline-block',
            padding: '8px 12px',
            background: 'rgba(242, 206, 90, 0.1)',
            border: '1px solid #f2ce5a',
            borderRadius: '6px',
            color: '#f2ce5a',
            textDecoration: 'none',
            fontSize: 'var(--font-sm)',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          Sblocca Connessione HTTPS (Clicca qui)
        </a>
      )}
        <div style={{ fontSize: '0.85em', opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
          Per l'autenticazione o problemi tecnici: <br/>
          <strong>Contatta l'amministratore del sistema.</strong>
        </div>
    </div>
  );
};

const AuthErrorMessage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <p style={{ fontWeight: 'bold', color: '#ff4d4d' }}>Accesso Negato</p>
    <p>Il bot non è autorizzato ad accedere al server. Contatta l'amministratore per richiedere l'abilitazione del tuo accesso.</p>
  </div>
);

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
          {msg.text.startsWith('CONN_ERROR:') ? (
            <ConnectionErrorMessage text={msg.text} ollamaIp={OLLAMA_IP} />
          ) : msg.text.startsWith('AUTH_ERROR:') ? (
            <AuthErrorMessage />
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
