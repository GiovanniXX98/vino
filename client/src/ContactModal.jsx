import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from './config';

const ContactModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    oggetto: 'Richiesta Autenticazione Server',
    messaggio: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Errore durante l\'invio del messaggio');
      
      setSent(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Contattaci</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {sent ? (
          <div className="success-message">
            <CheckCircle size={48} color="var(--success)" />
            <p>Messaggio inviato con successo! Ti risponderemo presto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Nome</label>
              <input 
                type="text" 
                required 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                placeholder="Il tuo nome"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="la-tua@email.com"
              />
            </div>
            <div className="form-group">
              <label>Oggetto</label>
              <select 
                value={formData.oggetto}
                onChange={e => setFormData({...formData, oggetto: e.target.value})}
              >
                <option value="Richiesta Autenticazione Server">Richiesta Autenticazione Server</option>
                <option value="Richiesta Collaborazione">Richiesta Collaborazione</option>
                <option value="Problemi Tecnici">Problemi Tecnici</option>
                <option value="Informazioni Generali">Informazioni Generali</option>
              </select>
            </div>
            <div className="form-group">
              <label>Messaggio</label>
              <textarea 
                required 
                rows={5}
                value={formData.messaggio}
                onChange={e => setFormData({...formData, messaggio: e.target.value})}
                placeholder="Descrivi la tua richiesta..."
              ></textarea>
            </div>
            
            {error && <p className="error-text">{error}</p>}
            
            <button type="submit" className="btn submit-btn" disabled={loading}>
              {loading ? <Loader2 className="spinning" /> : <Send size={18} />}
              <span>Invia Messaggio</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
