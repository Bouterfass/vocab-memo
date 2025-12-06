import React, { useRef, useState } from 'react';
import { NeuButton } from './ui/NeuButton';
import { Word } from '../types';
import { parseCSV } from '../services/csvService';

interface SetupScreenProps {
  onComplete: (initialWords: Word[]) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEmpty = () => {
    onComplete([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const words = parseCSV(text);
        if (words.length === 0) {
          setError("Le fichier CSV semble vide ou mal formaté.");
          console.error("CSV parsed but result is empty.");
          return;
        }
        onComplete(words);
      } catch (err) {
        console.error("CSV Import Error:", err);
        setError("Erreur lors de la lecture du fichier CSV. Vérifiez la console.");
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 flex flex-col min-h-[500px]">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-neu-text mb-2">Bienvenue</h1>
        <p className="text-neu-text/80 mb-8 px-4">
          Configurez votre extension VocabMemo pour commencer.
        </p>

        <div className="w-full space-y-4">
          <NeuButton fullWidth onClick={handleCreateEmpty}>
            Créer une base vide
          </NeuButton>
          
          <div className="relative w-full">
            <input 
              type="file" 
              accept=".csv,.txt" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <NeuButton fullWidth variant="secondary" onClick={triggerFileUpload}>
              Importer un CSV
            </NeuButton>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl bg-red-100 text-red-600 text-xs shadow-neu-in w-full">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};