export interface Word {
  id: string;
  english: string;
  french: string;
  example?: string;
  dateAdded: string; // ISO String
  correctCount: number;
  errorCount: number;
  lastTested?: string; // ISO String
}

export enum AppScreen {
  SETUP = 'SETUP',
  MAIN = 'MAIN',
  TEST = 'TEST'
}

export interface VocabularyStats {
  totalWords: number;
}