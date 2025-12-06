import { Word } from '../types';

const STORAGE_KEY_WORDS = 'vocab_extension_words';
const STORAGE_KEY_CONFIGURED = 'vocab_extension_configured';

export const getStoredWords = (): Word[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_WORDS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading words", e);
    return [];
  }
};

export const saveWords = (words: Word[]): void => {
  localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(words));
};

export const isAppConfigured = (): boolean => {
  return localStorage.getItem(STORAGE_KEY_CONFIGURED) === 'true';
};

export const setAppConfigured = (): void => {
  localStorage.setItem(STORAGE_KEY_CONFIGURED, 'true');
};

export const resetAppConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY_WORDS);
  localStorage.removeItem(STORAGE_KEY_CONFIGURED);
};

export const addWordToStorage = (word: Word): Word[] => {
  const currentWords = getStoredWords();
  const newWords = [word, ...currentWords];
  saveWords(newWords);
  return newWords;
};

export const updateWordStats = (wordId: string, isCorrect: boolean): void => {
  const words = getStoredWords();
  const updatedWords = words.map(w => {
    if (w.id === wordId) {
      return {
        ...w,
        correctCount: isCorrect ? w.correctCount + 1 : w.correctCount,
        errorCount: isCorrect ? w.errorCount : w.errorCount + 1,
        lastTested: new Date().toISOString()
      };
    }
    return w;
  });
  saveWords(updatedWords);
};