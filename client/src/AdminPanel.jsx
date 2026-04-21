import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Calendar, User, Trash2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from './config';

const AdminPanel = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Errore login');
      
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setToken(null);
          localStorage.removeItem('admin_token');
        }
        throw new Error(data.error || 'Errore caricamento');
      }
      setContacts(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Pannello Amministratore</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {!token ? (
          <form onSubmit={handleLogin} className="contact-form">
            <div className="form-group">
              <label><Lock size={16} /> Password Admin</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Inserisci password admin"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn submit-btn" disabled={loading}>
              Accedi
            </button>
          </form>
        ) : (
          <div className="admin-dashboard">
            <div className="admin-actions">
              <button className="btn" onClick={fetchContacts} disabled={loading}>
                <RefreshCw size={18} className={loading ? 'spinning' : ''} /> Aggiorna
              </button>
              <button className="btn" style={{background: 'var(--error)'}} onClick={() => { setToken(null); localStorage.removeItem('admin_token'); }}>
                Logout
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="contacts-list">
              {contacts.length === 0 ? (
                <p style={{textAlign: 'center', opacity: 0.5}}>Nessun messaggio ricevuto.</p>
              ) : (
                contacts.map(c => (
                  <div key={c.id} className="contact-card">
                    <div className="contact-card-header">
                      <span className="contact-subject">{c.oggetto}</span>
                      <span className="contact-date"><Calendar size={12} /> {c.data}</span>
                    </div>
                    <div className="contact-info">
                      <span><User size={12} /> {c.nome}</span>
                      <a href={`mailto:${c.email}`}><Mail size={12} /> {c.email}</a>
                    </div>
                    <p className="contact-msg">{c.messaggio}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
