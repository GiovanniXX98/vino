import React, { useState, useEffect } from 'react';
import { Wine, Award, RotateCcw, ArrowLeft, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import quizData from './data/quizData.json';
import Chatbot from './Chatbot';
import ContactModal from './ContactModal';
import AdminPanel from './AdminPanel';
import { OLLAMA_BASE_URL, OLLAMA_IP } from './config';

const Quiz = ({ user, setUser }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [aiStatus, setAiStatus] = useState('checking'); // 'checking', 'available', 'locked'

  useEffect(() => {
    const checkAi = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondi timeout
        
        await fetch(OLLAMA_BASE_URL.replace('/api/generate', ''), { 
          method: 'GET',
          signal: controller.signal
        });
        setAiStatus('available');
        clearTimeout(timeoutId);
      } catch (err) {
        console.warn("AI Connection check failed:", err);
        setAiStatus('locked');
      }
    };
    checkAi();
  }, []);

  const getLevel = (points) => Math.floor(points / 20) + 1;
  const currentQuiz = quizData[currentIndex];

  const handleOptionClick = (idx) => {
    if (feedback) return; // already answered
    const isCorrect = idx === currentQuiz.answer;
    const result = {
      correct: isCorrect,
      correctAnswer: currentQuiz.answer,
      newPoints: isCorrect ? user.points + currentQuiz.points : user.points,
      explanation: currentQuiz.explanation || null,
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

  const handleDragStart = (e) => {
    const y = e.pageY || (e.touches && e.touches[0].pageY);
    setDragStart(y);
  };

  const handleDragMove = (e) => {
    if (dragStart === null) return;
    const y = e.pageY || (e.touches && e.touches[0].pageY);
    const offset = Math.max(0, dragStart - y);
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (dragOffset > 100) {
      setShowQuiz(true);
    }
    setDragStart(null);
    setDragOffset(0);
  };

  if (!quizData.length) return <div style={{ padding: '2rem' }}>Caricamento quiz...</div>;

  return (
    <div className="quiz-container">
      {/* Full-screen logo overlay */}
      {!showQuiz && (
        <div 
          className="logo-overlay" 
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ cursor: dragStart ? 'grabbing' : 'grab' }}
        >
          <div 
            className="logo-content"
            style={{ 
              transform: `translateY(-${dragOffset}px)`,
              opacity: 1 - dragOffset / 300,
              transition: dragStart ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
            }}
          >
            <div className="logo-circle">
              <img src="/vino/logo.png" alt="Logo" />
            </div>
            <div className="swipe-hint">
              <span className="swipe-text">SWIPE UP</span>
              <div className="swipe-arrow"></div>
            </div>


            <div className="ai-status-panel">
              {aiStatus === 'checking' && (
                <div className="ai-status checking">
                  <Loader2 className="spinning" size={18} />
                  <span>Verifica connessione AI...</span>
                </div>
              )}
              {aiStatus === 'available' && (
                <div className="ai-status available">
                  <ShieldCheck size={18} />
                  <span>Esperto AI Pronto</span>
                </div>
              )}
              {aiStatus === 'locked' && (
                <div className="ai-status locked">
                  <ShieldAlert size={18} />
                  <span>Connessione AI Protetta</span>
                  <a 
                    href={`https://${OLLAMA_IP}:11435`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="unlock-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Sblocca ora
                  </a>
                </div>
              )}
              <button 
                className={`btn llm-btn ${aiStatus === 'available' ? 'pulse' : ''}`} 
                onClick={(e) => { e.stopPropagation(); openChat(); }}
                disabled={aiStatus === 'checking'}
              >
                {aiStatus === 'locked' ? "Riprova Chat" : "Chat con l'Esperto AI"}
              </button>

              <button 
                className="btn contact-btn" 
                onClick={(e) => { e.stopPropagation(); setShowContact(true); }}
              >
                Contattaci
              </button>
            </div>

            <div 
              className="admin-link" 
              onClick={(e) => { e.stopPropagation(); setShowAdmin(true); }}
            >
              Area Admin
            </div>
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
                {feedback.explanation && (
                  <div className="explanation-card">
                    <span className="explanation-icon">💡</span>
                    <p>{feedback.explanation}</p>
                  </div>
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
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default Quiz;
