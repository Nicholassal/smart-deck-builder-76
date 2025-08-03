export interface ImageMask {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isVisible: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  imageMasks?: ImageMask[];
  difficulty: 'easy' | 'medium' | 'hard';
  fsrsData: FSRSData;
}

export interface FSRSData {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3; // 0=new, 1=learning, 2=review, 3=relearning
  lastReview?: Date;
  nextReview: Date;
}

export interface Section {
  id: string;
  name: string;
  deckId: string;
  flashcards: Flashcard[];
  createdAt: Date;
  week?: number;
}

export interface Deck {
  id: string;
  name: string;
  fileId: string;
  sections: Section[];
  createdAt: Date;
  courseName?: string;
}

export interface StudyFile {
  id: string;
  name: string;
  decks: Deck[];
  createdAt: Date;
  semester?: string;
  year?: number;
}

export interface StudySession {
  id: string;
  flashcardId: string;
  response: 'again' | 'hard' | 'good' | 'easy';
  responseTime: number; // in milliseconds
  timestamp: Date;
  isCorrect: boolean;
}

export interface EditSession {
  id: string;
  flashcardId: string;
  editType: 'question_edit' | 'answer_edit' | 'card_delete' | 'card_add';
  originalText?: string;
  newText?: string;
  timestamp: Date;
}

export interface StudyPlan {
  id: string;
  deckId: string;
  examDate: Date;
  sections: string[];
  dailyTarget: number;
  createdAt: Date;
}

export interface Exam {
  id: string;
  name: string;
  date: Date;
  fileIds: string[];
  deckIds: string[];
  color: string;
  studyPlan: StudySchedule[];
  createdAt: Date;
}

export interface StudySchedule {
  date: Date;
  deckId: string;
  sectionIds: string[];
  estimatedMinutes: number;
  completed: boolean;
  actualMinutes?: number;
  completionPercentage?: number;
  skipped: boolean;
}

export interface StudyFileWithColor extends StudyFile {
  color: string;
}