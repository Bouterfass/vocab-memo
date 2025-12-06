import React, { useState, useEffect } from 'react';
import { NeuButton } from './ui/NeuButton';
import { NeuInput } from './ui/NeuInput';
import { Word } from '../types';
import { addWordToStorage, getStoredWords } from '../services/storageService';
import { exportToCSV } from '../services/csvService';

interface MainScreenProps {
  onNavigateTest: () => void;
  onReset: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ onNavigateTest, onReset }) => {
  const [english, setEnglish] = useState('');
  const [french, setFrench] = useState('');
  const [example, setExample] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false); // 👈 pour indiquer la traduction en cours

  const [suggestedExamples, setSuggestedExamples] = useState<string[]>([]);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Récupère prononciation + exemple depuis DictionaryAPI
  const fetchDictionaryData = async (word: string) => {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      );

      if (!res.ok) return;

      const data = await res.json() as any[];

      if (!Array.isArray(data) || !data[0] || !data[0].meanings) return;

      const entry = data[0];

      // Audio
      const audioEntry = entry.phonetics?.find((p: any) => p.audio);
      if (audioEntry?.audio) setAudioUrl(audioEntry.audio);

      // Plusieurs exemples possibles
      const examples: string[] = [];

      entry.meanings.forEach((meaning: any) => {
        meaning.definitions?.forEach((def: any) => {
          if (def.example) examples.push(def.example);
        });
      });

      // On garde que les exemples uniques
      const uniqueExamples = [...new Set(examples)];

      if (uniqueExamples.length > 0) {
        setSuggestedExamples(uniqueExamples);
        setCurrentExampleIndex(0);
      }
    } catch (e) {
      console.error("Erreur DictionaryAPI:", e);
    }
  };


  // Traduction EN -> FR avec l'API Google (endpoint non officiel)
  const translateWord = async (word: string): Promise<string> => {
    const normalized = word.trim();

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(normalized)}`
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error('Erreur API Google Translate', res.status, txt);
      throw new Error(`Erreur API: ${res.status}`);
    }

    const data = await res.json() as any;

    // structure typique : [[["monde","world",null,null,...]],null,"en",...]
    const translated =
      (data?.[0]?.[0]?.[0] as string | undefined)?.trim() ?? '';

    if (!translated) {
      throw new Error('Traduction vide');
    }

    return translated;
  };


  useEffect(() => {
    // En dev (localhost:3000), "chrome" n'existe pas → on sort
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }


    chrome.storage.local.get(['selectedWord'], async (result: { selectedWord?: string }) => {
      const raw = (result.selectedWord || '').trim();
      if (!raw) return;

      // Optionnel : on nettoie la clé après usage
      chrome.storage.local.remove('selectedWord');

      // On normalise un peu le mot
      const selectedWord = raw.toLowerCase();

      // On pré-remplit le champ anglais sans écraser si l'utilisateur a déjà tapé
      setEnglish((prev) => prev || selectedWord);

      // 1) Traduction auto
      try {
        setLoading(true);
        setMessage(null);
        const translated = await translateWord(selectedWord);
        setFrench((prev) => prev || translated);
        setMessage({ type: 'success', text: 'Traduction récupérée automatiquement.' });
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Impossible de traduire automatiquement.' });
      } finally {
        setLoading(false);
      }

      // 2) Données dictionnaire (audio + exemples)
      fetchDictionaryData(selectedWord);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!english.trim() || !french.trim()) {
      setMessage({ type: 'error', text: 'Champs obligatoires manquants.' });
      return;
    }

    const finalExample =
      example.trim() ||
      (suggestedExamples.length > 0
        ? suggestedExamples[currentExampleIndex].trim()
        : '');

    const newWord: Word = {
      id: Date.now().toString(),
      english: english.trim(),
      french: french.trim(),
      example: example.trim(),
      dateAdded: new Date().toISOString(),
      correctCount: 0,
      errorCount: 0
    };

    addWordToStorage(newWord);

    setEnglish('');
    setFrench('');
    setExample('');
    setMessage({ type: 'success', text: 'Mot ajouté !' });

    setTimeout(() => setMessage(null), 2500);
  };

  const handleExportAndReset = () => {
    const words = getStoredWords();
    if (words.length === 0) {
      setMessage({ type: 'error', text: 'Rien à exporter.' });
      return;
    }
    exportToCSV(words);
    onReset();
  };

  return (
    <div className="p-6 h-full min-h-[500px] flex flex-col relative box-border">

      {/* Header Row */}
      <div className="relative flex justify-center items-center pt-2 mb-4 shrink-0">
        {/* Title Centered */}
        <h1 className="text-3xl font-bold text-neu-text tracking-wide mt-1">VocabMemo</h1>

        {/* Test Button - Absolute Positioned to match App.tsx Helper Button (top-6 right-6) */}
        <button
          onClick={onNavigateTest}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-neu-base shadow-neu-out active:shadow-neu-in flex items-center justify-center text-neu-accent transition-all hover:scale-105 hover:text-neu-accent/80"
          title="Mode Test"
          style={{ marginTop: '0px' }} // Adjusted by parent padding/layout, actually let's use fixed absolute relative to container
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Main Content - Vertically Centered */}
      <div className="flex-1 flex flex-col justify-center py-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neu-text opacity-80">
              Anglais
            </span>
          </div>
          <NeuInput
            label="Anglais"
            labelRightContent={audioUrl && (
              <button
                type="button"
                className="text-xs px-2 py-1 rounded-full bg-neu-base shadow-neu-out active:shadow-neu-in text-neu-accent hover:scale-105 transition-all"
                onClick={() => new Audio(audioUrl).play()}
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-neu-accent">
                  <path d="M11 5L6 9H3v6h3l5 4V5zm5.54.46a1 1 0 10-1.41 1.41A5 5 0 0117 12a5 5 0 01-1.87 3.87 1 1 0 001.41 1.41A7 7 0 0019 12a7 7 0 00-2.46-5.54z" />
                  <path d="M15.12 7.88a1 1 0 00-1.41 1.41A3 3 0 0114 12a3 3 0 01-.29 1.29 1 1 0 101.83.83A5 5 0 0016 12a5 5 0 00-.88-2.88z" />
                </svg>
              </button>
            )}
            placeholder="ex: Ruthless"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            autoFocus
          />

          <NeuInput
            label="Français"
            placeholder="ex: Impitoyable / Sans pitié"
            value={french}
            onChange={(e) => setFrench(e.target.value)}
          />

          {suggestedExamples.length > 0 && (
            <div className="mt-2 p-3 rounded-xl bg-neu-base shadow-neu-in">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-neu-text/70">
                  Exemple :
                </span>

                {/* Bouton refresh → montre l’exemple suivant */}
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-full bg-neu-base shadow-neu-out active:shadow-neu-in text-neu-accent hover:scale-105 transition-all"
                  onClick={() => {
                    setCurrentExampleIndex((prev) =>
                      (prev + 1) % suggestedExamples.length
                    );
                  }}
                  title="Voir un autre exemple"
                >
                  ↻
                </button>
              </div>

              <p className="text-sm text-neu-text/80 italic">
                "{suggestedExamples[currentExampleIndex]}"
              </p>
            </div>
          )}

          <div className="pt-4">
            <NeuButton type="submit" fullWidth>
              ajouter
            </NeuButton>
          </div>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm shadow-neu-in font-medium animate-pulse ${message.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
            }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Footer Actions - More Visible */}
      <div className="shrink-0 pt-6 pb-2 text-center">
        <button
          className="px-4 py-2 text-sm font-bold text-neu-text hover:text-red-500 transition-colors underline decoration-2 decoration-neu-text/20 hover:decoration-red-500/50 rounded-lg hover:bg-neu-base hover:shadow-neu-out active:shadow-neu-in"
          onClick={handleExportAndReset}
        >
          exporter la liste et réinitialiser
        </button>
      </div>
    </div>
  );
};