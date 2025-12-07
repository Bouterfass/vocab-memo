import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/SetupScreen';
import { MainScreen } from './components/MainScreen';
import { TestScreen } from './components/TestScreen';
import { InfoScreen } from './components/InfoScreen';
import { AppScreen, Word } from './types';
import { isAppConfigured, setAppConfigured, saveWords, resetAppConfig } from './services/storageService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Check initial configuration on mount
    const configured = isAppConfigured();
    if (configured) {
      setCurrentScreen(AppScreen.MAIN);
    } else {
      setCurrentScreen(AppScreen.SETUP);
    }
  }, []);

  const handleSetupComplete = (initialWords: Word[]) => {
    saveWords(initialWords);
    setAppConfigured();
    setCurrentScreen(AppScreen.MAIN);
  };

  const handleReset = () => {
    resetAppConfig();
    setCurrentScreen(AppScreen.SETUP);
  };

  const navigateToTest = () => {
    setCurrentScreen(AppScreen.TEST);
  };

  const navigateToMain = () => {
    setCurrentScreen(AppScreen.MAIN);
  };

  if (!currentScreen) return null;

  return (
    <div className="relative h-full min-h-[500px] bg-neu-base text-neu-text selection:bg-neu-accent selection:text-white overflow-hidden font-sans">
      
      {/* Helper Button (Fixed top LEFT now) - Aligned with the Test button in MainScreen */}
      {!showInfo && (
        <button 
          onClick={() => setShowInfo(true)}
          className="absolute top-6 right-6 z-40 w-10 h-10 rounded-full shadow-neu-out active:shadow-neu-in flex items-center justify-center text-neu-text font-bold text-lg hover:text-neu-accent transition-colors"
          title="Aide"
        >
          ?
        </button>
      )}

      {/* Info Screen Overlay */}
      {showInfo && (
        <InfoScreen onBack={() => setShowInfo(false)} />
      )}

      {/* Main Content Area */}
      <div className={`h-full transition-opacity duration-200 ${showInfo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {currentScreen === AppScreen.SETUP && (
          <SetupScreen onComplete={handleSetupComplete} />
        )}
        
        {currentScreen === AppScreen.MAIN && (
          <MainScreen 
            onNavigateTest={navigateToTest} 
            onReset={handleReset}
          />
        )}
        
        {currentScreen === AppScreen.TEST && (
          <TestScreen onBack={navigateToMain} />
        )}
      </div>
    </div>
  );
};

export default App;