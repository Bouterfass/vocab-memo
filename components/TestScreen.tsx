import React, { useState, useEffect, useRef } from 'react';
import { NeuButton } from './ui/NeuButton';
import { NeuInput } from './ui/NeuInput';
import { Word } from '../types';
import { getStoredWords, updateWordStats } from '../services/storageService';

interface TestScreenProps {
  onBack: () => void;
}

type TestState = 'SETUP' | 'TESTING' | 'SUMMARY';
type TestDirection = 'EN_FR' | 'FR_EN';

export const TestScreen: React.FC<TestScreenProps> = ({ onBack }) => {
  const [testState, setTestState] = useState<TestState>('SETUP');
  const [direction, setDirection] = useState<TestDirection>('EN_FR');
  const [words, setWords] = useState<Word[]>([]);
  const [testQueue, setTestQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Word[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setWords(getStoredWords());
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startTest = () => {
    if (words.length === 0) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setTestQueue(selected);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setFeedback(null);
    setUserAnswer('');
    setTestState('TESTING');
  };

  const advanceToNext = () => {
    setFeedback(null);
    setUserAnswer('');
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= testQueue.length) {
        setTestState('SUMMARY');
        return prevIndex;
      }
      return nextIndex;
    });
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return; 

    const currentWord = testQueue[currentIndex];
    const targetAnswer = direction === 'EN_FR' ? currentWord.french : currentWord.english;
    const normalizedUser = userAnswer.trim().toLowerCase();
    
    // Logic for slash separated answers
    const possibleAnswers = targetAnswer.toLowerCase().split('/').map(ans => ans.trim());
    const isCorrect = possibleAnswers.includes(normalizedUser) || normalizedUser === targetAnswer.trim().toLowerCase();

    updateWordStats(currentWord.id, isCorrect);

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback({ isCorrect: true, correctAnswer: targetAnswer });
    } else {
      setMistakes(m => [...m, currentWord]);
      setFeedback({ isCorrect: false, correctAnswer: targetAnswer });
    }

    timerRef.current = setTimeout(() => {
      advanceToNext();
    }, 1000);
  };

  // Setup View
  if (testState === 'SETUP') {
    return (
      <div className="p-6 pt-8 flex flex-col min-h-[500px]">
        <button onClick={onBack} className="self-start mb-8 text-neu-text opacity-70 hover:opacity-100 flex items-center transition-opacity">
          <span className="mr-1">←</span> Retour
        </button>
        
        <div className="flex-1 flex flex-col justify-center text-center space-y-6">
          <h1 className="text-2xl font-bold text-neu-text">Mode Test</h1>
          <p className="text-sm text-neu-text/80">Choisissez la direction :</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setDirection('EN_FR')}
              className={`w-full p-4 rounded-xl shadow-neu-out text-sm font-semibold transition-transform active:scale-95 outline-none focus:ring-2 focus:ring-neu-accent/20 ${
                direction === 'EN_FR' ? 'ring-2 ring-neu-accent text-neu-accent' : 'text-neu-text'
              }`}
            >
              Anglais ➔ Français
            </button>
            <button
              onClick={() => setDirection('FR_EN')}
              className={`w-full p-4 rounded-xl shadow-neu-out text-sm font-semibold transition-transform active:scale-95 outline-none focus:ring-2 focus:ring-neu-accent/20 ${
                direction === 'FR_EN' ? 'ring-2 ring-neu-accent text-neu-accent' : 'text-neu-text'
              }`}
            >
              Français ➔ Anglais
            </button>
          </div>

          <div className="pt-6">
            {words.length > 0 ? (
                <NeuButton onClick={startTest} fullWidth>
                Commencer ({words.length} mots)
                </NeuButton>
            ) : (
                <p className="text-red-500 text-xs">Aucun mot disponible.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Summary View
  if (testState === 'SUMMARY') {
    return (
      <div className="p-6 pt-16 flex flex-col min-h-[500px]">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-neu-text mb-6">Résultat</h1>
            
            <div className="w-32 h-32 rounded-full shadow-neu-out bg-neu-base flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-neu-accent">{score}/{testQueue.length}</span>
            </div>

            {mistakes.length > 0 && (
            <div className="w-full text-left mb-6">
                <h3 className="font-bold text-neu-text text-sm mb-2">Erreurs :</h3>
                <div className="bg-neu-base shadow-neu-in rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-2">
                    {mistakes.map(m => (
                        <li key={m.id} className="text-xs text-red-600 border-b border-neu-dark/10 last:border-0 pb-1">
                        <b>{m.english}</b> = {m.french}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
            )}

            <div className="w-full space-y-3">
              <NeuButton onClick={startTest} fullWidth>Recommencer</NeuButton>
              <NeuButton onClick={onBack} variant="secondary" fullWidth>Menu Principal</NeuButton>
            </div>
        </div>
      </div>
    );
  }

  // Testing View
  const currentWord = testQueue[currentIndex];
  const question = direction === 'EN_FR' ? currentWord.english : currentWord.french;
  const label = direction === 'EN_FR' ? "Traduisez en Français" : "Translate to English";

  return (
    <div className="p-6 pt-16 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-8 text-neu-text/50 font-bold text-xs">
           <button onClick={onBack} className="hover:text-neu-text transition-colors">QUITTER</button>
           <span>{currentIndex + 1} / {testQueue.length}</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8 text-center">
                <span className="text-xs uppercase tracking-widest text-neu-text/60 font-bold block mb-3">{label}</span>
                <h2 className="text-3xl font-bold text-neu-text break-words">{question}</h2>
                {currentWord.example && !feedback && (
                    <p className="mt-4 text-sm text-neu-text/60 italic px-4">"{currentWord.example}"</p>
                )}
            </div>

            <form onSubmit={handleValidate}>
                {!feedback ? (
                    <>
                        <NeuInput
                            placeholder="Votre réponse..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            autoFocus
                        />
                        <div className="mt-8">
                            <NeuButton type="submit" fullWidth>Valider</NeuButton>
                        </div>
                    </>
                ) : (
                    <div className="mt-4 p-4 rounded-xl shadow-neu-in text-center animate-pulse bg-neu-base">
                        <p className={`font-bold text-lg mb-1 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback.isCorrect ? 'Correct !' : 'Incorrect'}
                        </p>
                        {!feedback.isCorrect && (
                            <p className="text-sm text-neu-text">
                                Réponse : <strong>{feedback.correctAnswer}</strong>
                            </p>
                        )}
                        <div className="mt-2 text-xs text-neu-text/40">Suite...</div>
                    </div>
                )}
            </form>
        </div>
    </div>
  );
};