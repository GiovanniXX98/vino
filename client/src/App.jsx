import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Auth from './Auth';
import Quiz from './Quiz';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
      }).catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return <div>Caricamento...</div>;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Auth onLogin={setUser} /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Quiz user={user} setUser={setUser} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
