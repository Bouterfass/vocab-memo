import React from 'react';
import { NeuCard } from './ui/NeuCard';

interface InfoScreenProps {
  onBack: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 bg-neu-base z-50 p-4 flex flex-col animate-[slideIn_0.3s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      
      {/* Header avec bouton retour */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full shadow-neu-out active:shadow-neu-in text-neu-text transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-neu-text">Aide & Astuces</h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        
        <section>
          <h2 className="text-neu-accent font-bold mb-2">Comment ça marche ?</h2>
          <p className="text-sm text-neu-text/80 text-justify">
            VocabMemo stocke vos mots directement dans votre navigateur. Ajoutez des mots manuellement ou importez une liste existante.
          </p>
        </section>

        <section>
          <h2 className="text-neu-accent font-bold mb-2">Traductions multiples</h2>
          <p className="text-sm text-neu-text/80 text-justify mb-2">
            Un mot peut avoir plusieurs sens. Utilisez le symbole <strong>/</strong> pour les séparer.
          </p>
          <div className="bg-neu-base shadow-neu-in rounded-lg p-3 text-xs font-mono text-neu-text/70">
            Exemple :<br/>
            Anglais: <span className="text-neu-text">ruthless</span><br/>
            Français: <span className="text-neu-text">impitoyable / sans pitié</span>
          </div>
          <p className="text-xs text-neu-text/60 mt-2">
            En mode test, si vous écrivez "impitoyable" OU "sans pitié", la réponse sera validée !
          </p>
        </section>

        <section>
          <h2 className="text-neu-accent font-bold mb-2">Format CSV pour l'import</h2>
          <p className="text-sm text-neu-text/80 text-justify mb-2">
            Vous pouvez importer un fichier `.csv` ou `.txt` simple. L'ordre des colonnes doit être :
          </p>
          <ol className="list-decimal list-inside text-sm text-neu-text/80 ml-2 space-y-1">
            <li>Mot en anglais</li>
            <li>Traduction française</li>
            <li>Exemple (optionnel)</li>
          </ol>
          <p className="text-xs text-neu-text/60 mt-2">
            Le système détecte automatiquement les virgules (,) ou points-virgules (;).
          </p>
        </section>

        <section>
          <h2 className="text-neu-accent font-bold mb-2">Sauvegarde</h2>
          <p className="text-sm text-neu-text/80 text-justify">
            Vos données sont locales. Pensez à faire un <strong>Export CSV</strong> régulièrement depuis l'écran principal pour sauvegarder votre liste.
          </p>
        </section>

      </div>
    </div>
  );
};