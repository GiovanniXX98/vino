import React, { useState, useEffect } from 'react';
import api from './api';
import { Wine, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Quiz = ({ user, setUser }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await api.get('/api/quiz');
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const currentQuiz = quizzes[currentIndex];

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/quiz/answer', {
        quizId: currentQuiz.id,
        answerIndex: selectedOption
      });
      
      setFeedback(data);
      if (data.correct) {
        setUser({ ...user, points: data.newPoints, level: data.newLevel });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % quizzes.length);
  };

  if (!quizzes.length) return <div style={{padding:'2rem'}}>Caricamento quiz...</div>;

  return (
    <div className="quiz-container">
      <div className="header">
        <div>
          <h2>Benvenuto, {user.nome}</h2>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Award size={24} /> Livello {user.level}
          </div>
          <div className="stat-badge">
            <Wine size={24} /> {user.points} pt
          </div>
          <button onClick={handleLogout} className="btn" style={{width:'auto', padding:'0.5rem 1rem'}}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="question-card">
        <h3 className="question-text">{currentQuiz.question}</h3>
        <div className="options-grid">
          {currentQuiz.options.map((opt, idx) => (
            <button 
              key={idx} 
              className={`option-btn ${selectedOption === idx ? 'selected' : ''}`}
              onClick={() => !feedback && setSelectedOption(idx)}
              style={
                feedback && feedback.correctAnswer === idx 
                  ? { borderColor: 'var(--success)', background: 'rgba(46, 125, 50, 0.2)' }
                  : feedback && selectedOption === idx && !feedback.correct
                  ? { borderColor: 'var(--error)', background: 'rgba(198, 40, 40, 0.2)' }
                  : {}
              }
            >
              {opt}
            </button>
          ))}
        </div>

        {!feedback ? (
          <button className="btn submit-btn" onClick={handleSubmit} disabled={selectedOption === null}>
            Conferma Risposta
          </button>
        ) : (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {feedback.correct ? (
              <h3 style={{ color: 'var(--success)' }}>Risposta Esatta! +{currentQuiz.points}pt</h3>
            ) : (
              <h3 style={{ color: 'var(--error)' }}>Risposta Sbagliata! Riprova la prossima volta.</h3>
            )}
            <button className="btn submit-btn" onClick={nextQuestion} style={{ marginTop: '1rem' }}>
              Prossima Domanda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
