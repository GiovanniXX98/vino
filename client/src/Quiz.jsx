import React, { useState } from 'react';
import { Wine, Award, RotateCcw, ArrowLeft } from 'lucide-react';
import quizData from './data/quizData.json';
import Chatbot from './Chatbot';

const Quiz = ({ user, setUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const getLevel = (points) => Math.floor(points / 20) + 1;
  const currentQuiz = quizData[currentIndex];

  const handleOptionClick = (idx) => {
    if (feedback) return; // already answered
    const isCorrect = idx === currentQuiz.answer;
    const result = {
      correct: isCorrect,
      correctAnswer: currentQuiz.answer,
      newPoints: isCorrect ? user.points + currentQuiz.points : user.points,
    };
    setSelectedOption(idx);
    setFeedback(result);
    if (isCorrect) {
      setUser({ ...user, points: result.newPoints, level: getLevel(result.newPoints) });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % quizData.length);
  };

  const resetGame = () => {
    if (window.confirm('Sei sicuro di voler resettare tutti i tuoi punti?')) {
      const resetUser = { nome: 'Enologo', points: 0, level: 1 };
      setUser(resetUser);
      setFeedback(null);
      setSelectedOption(null);
      setCurrentIndex(0);
    }
  };

  const openChat = () => setShowChat(true);
  const closeChat = () => setShowChat(false);

  if (!quizData.length) return <div style={{ padding: '2rem' }}>Caricamento quiz...</div>;

  return (
    <div className="quiz-container">
      {/* Full-screen logo overlay */}
      {!showQuiz && (
        <div className="logo-overlay" onClick={() => setShowQuiz(true)}>
          <div className="logo-circle">
            <img src="/vino/logo.png" alt="Logo" />
          </div>
          <div className="llm-container">
            <button className="btn llm-btn" onClick={(e) => { e.stopPropagation(); openChat(); }}>
              Chat with NotebookLM AI
            </button>
          </div>
        </div>
      )}
      {showQuiz && (
        <>
          <div className="header">
            <button onClick={() => setShowQuiz(false)} className="btn-icon" title="Torna alla Home" style={{ marginRight: '1rem' }}>
              <ArrowLeft size={24} />
            </button>
            <div className="header-stats" style={{ flex: 1, justifyContent: 'flex-end' }}>
              <div className="stat-badge">
                <Award size={24} /> Livello {user.level}
              </div>
              <div className="stat-badge">
                <Wine size={24} /> {user.points} pt
              </div>
              <button
                onClick={resetGame}
                className="btn"
                title="Resetta Progressi"
                style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--error)' }}
              >
                <RotateCcw size={20} />
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
                  onClick={() => handleOptionClick(idx)}
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

            {feedback && (
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
        </>
      )}
      {showChat && <Chatbot onClose={closeChat} />}
    </div>
  );
};

export default Quiz;
