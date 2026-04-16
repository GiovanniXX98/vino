import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nome: '', cognome: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      if (isLogin) {
        const { data } = await axios.post('http://localhost:3000/api/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', data.token);
        onLogin(data.user);
        navigate('/');
      } else {
        const { data } = await axios.post('http://localhost:3000/api/register', formData);
        setMsg(data.message);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Errore di connessione');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Cantina Quiz</h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nome</label>
                <input required type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Cognome</label>
                <input required type="text" value={formData.cognome} onChange={(e) => setFormData({...formData, cognome: e.target.value})} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
          {msg && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>{msg}</p>}
          
          <button type="submit" className="btn">
            {isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>
        <div className="toggle-auth">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Registrati" : "Accedi"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
