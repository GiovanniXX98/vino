import React, { useState, useEffect } from 'react';
import Quiz from './Quiz';

function App() {
  const [user, setUser] = useState(() => {
    // Load progress from localStorage on initialization
    const saved = localStorage.getItem('quiz_user');
    return saved ? JSON.parse(saved) : { 
      nome: 'Enologo', 
      points: 0, 
      level: 1 
    };
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quiz_user', JSON.stringify(user));
  }, [user]);

  return (
    <div className="App">
      <Quiz user={user} setUser={setUser} />
    </div>
  );
}

export default App;
