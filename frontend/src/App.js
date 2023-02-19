import React from 'react';
import Home from './Home';
import { useState } from 'react';

const App = () => {
  const [questionnaireId, setQuestionnaireId] = useState('');   // hook to manage the state of the questionnaireId input field
  const [error, setError] = useState(null);

  return (
    <Home />
  );
}

export default App;