import React, { useState, useEffect, useRef } from 'react';
import { callLLM } from './aiService';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Buongiorno! Sono il tuo Esperto Enologo. Come posso aiutarti oggi con il mondo dei vini?' }
  ]); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages change
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
      const errMsg = { role: 'assistant', text: 'Errore nella risposta del modello.' };
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
        <h4>Chat AI</h4>
        <button className="btn" onClick={onClose}>✕</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.role}`}> {msg.text} </div>
        ))}
        {loading && <div className="chatbot-message assistant">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Scrivi un messaggio..."
        />
        <button className="btn" onClick={sendMessage} disabled={loading}>Invia</button>
      </div>
    </div>
  );
};

export default Chatbot;
