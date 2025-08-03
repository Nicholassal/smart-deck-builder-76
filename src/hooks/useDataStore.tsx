import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudyFile, Deck, Section, Flashcard, StudySession, EditSession, Exam, StudySchedule, StudyFileWithColor, ImageMask } from '@/types/flashcard';
import { fsrsScheduler } from '@/lib/fsrs';

interface DataStoreState {
  files: StudyFileWithColor[];
  sessions: StudySession[];
  editSessions: EditSession[];
  exams: Exam[];
  currentFile: StudyFileWithColor | null;
  currentDeck: Deck | null;
  currentSection: Section | null;
}

interface DataStoreContextType extends DataStoreState {
  // File operations
  createFile: (name: string, semester?: string, year?: number, color?: string) => StudyFileWithColor;
  deleteFile: (fileId: string) => void;
  setCurrentFile: (file: StudyFileWithColor | null) => void;
  updateFileColor: (fileId: string, color: string) => void;
  
  // Deck operations
  createDeck: (fileId: string, name: string, courseName?: string) => Deck;
  deleteDeck: (deckId: string) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  
  // Section operations
  createSection: (deckId: string, name: string, week?: number) => Section;
  deleteSection: (sectionId: string) => void;
  setCurrentSection: (section: Section | null) => void;
  
  // Flashcard operations
  createFlashcard: (sectionId: string, question: string, answer: string, difficulty?: 'easy' | 'medium' | 'hard', imageUrl?: string, imageMasks?: ImageMask[]) => Flashcard;
  updateFlashcard: (flashcardId: string, question?: string, answer?: string, imageUrl?: string, imageMasks?: ImageMask[]) => void;
  deleteFlashcard: (flashcardId: string) => void;
  
  // Study operations
  studyFlashcard: (flashcardId: string, response: 'again' | 'hard' | 'good' | 'easy', responseTime: number, isCorrect: boolean) => void;
  getDueCards: () => Flashcard[];
  getCardsBySection: (sectionId: string) => Flashcard[];
  
  // Exam and Schedule operations
  createExam: (name: string, date: Date, fileIds: string[], deckIds: string[]) => Exam;
  updateExam: (examId: string, updates: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  updateStudyProgress: (examId: string, date: Date, deckId: string, completed: boolean, actualMinutes?: number, completionPercentage?: number, skipped?: boolean) => void;
  generateStudySchedule: (examId: string) => void;
  
  // Statistics
  getStudyStats: () => {
    totalCards: number;
    studiedToday: number;
    accuracy: number;
    streak: number;
    weeklyProgress: number[];
  };
  
  getPerformanceData: (deckId: string) => {
    averageAccuracy: number;
    recentSessions: number;
    difficulty: number;
  };
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

const STORAGE_KEY = 'studycards-data';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const FILE_COLORS = [
  'hsl(220, 90%, 56%)', // Blue
  'hsl(142, 76%, 36%)', // Green
  'hsl(346, 87%, 43%)', // Red
  'hsl(262, 83%, 58%)', // Purple
  'hsl(32, 95%, 44%)',  // Orange
  'hsl(187, 71%, 42%)', // Teal
  'hsl(291, 64%, 42%)', // Magenta
  'hsl(25, 95%, 53%)',  // Orange-red
];

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataStoreState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          files: (parsed.files || []).map((file: any, index: number) => ({
            ...file,
            color: file.color || FILE_COLORS[index % FILE_COLORS.length]
          })),
          sessions: parsed.sessions || [],
          editSessions: parsed.editSessions || [],
          exams: parsed.exams || [],
          currentFile: null,
          currentDeck: null,
          currentSection: null,
        };
      } catch (error) {
        console.error('Failed to parse stored data:', error);
      }
    }
    return {
      files: [],
      sessions: [],
      editSessions: [],
      exams: [],
      currentFile: null,
      currentDeck: null,
      currentSection: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      files: state.files,
      sessions: state.sessions,
      editSessions: state.editSessions,
      exams: state.exams,
    }));
  }, [state.files, state.sessions, state.editSessions, state.exams]);

  const createFile = (name: string, semester?: string, year?: number, color?: string): StudyFileWithColor => {
    const newFile: StudyFileWithColor = {
      id: generateId(),
      name,
      decks: [],
      createdAt: new Date(),
      semester,
      year,
      color: color || FILE_COLORS[state.files.length % FILE_COLORS.length],
    };
    
    setState(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
    
    return newFile;
  };

  const deleteFile = (fileId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId),
      currentFile: prev.currentFile?.id === fileId ? null : prev.currentFile
    }));
  };

  const setCurrentFile = (file: StudyFileWithColor | null) => {
    setState(prev => ({ ...prev, currentFile: file, currentDeck: null, currentSection: null }));
  };

  const updateFileColor = (fileId: string, color: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === fileId ? { ...file, color } : file
      )
    }));
  };

  const createDeck = (fileId: string, name: string, courseName?: string): Deck => {
    const newDeck: Deck = {
      id: generateId(),
      name,
      fileId,
      sections: [],
      createdAt: new Date(),
      courseName,
    };

    setState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === fileId 
          ? { ...file, decks: [...file.decks, newDeck] }
          : file
      )
    }));

    return newDeck;
  };

  const deleteDeck = (deckId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.filter(d => d.id !== deckId)
      })),
      currentDeck: prev.currentDeck?.id === deckId ? null : prev.currentDeck
    }));
  };

  const setCurrentDeck = (deck: Deck | null) => {
    setState(prev => ({ ...prev, currentDeck: deck, currentSection: null }));
  };

  const createSection = (deckId: string, name: string, week?: number): Section => {
    const newSection: Section = {
      id: generateId(),
      name,
      deckId,
      flashcards: [],
      createdAt: new Date(),
      week,
    };

    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.map(deck => 
          deck.id === deckId 
            ? { ...deck, sections: [...deck.sections, newSection] }
            : deck
        )
      }))
    }));

    return newSection;
  };

  const deleteSection = (sectionId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.map(deck => ({
          ...deck,
          sections: deck.sections.filter(s => s.id !== sectionId)
        }))
      })),
      currentSection: prev.currentSection?.id === sectionId ? null : prev.currentSection
    }));
  };

  const setCurrentSection = (section: Section | null) => {
    setState(prev => ({ ...prev, currentSection: section }));
  };

  const createFlashcard = (sectionId: string, question: string, answer: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', imageUrl?: string, imageMasks?: ImageMask[]): Flashcard => {
    const newFlashcard: Flashcard = {
      id: generateId(),
      question,
      answer,
      sectionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty,
      imageUrl,
      imageMasks,
      fsrsData: fsrsScheduler.initCard(),
    };

    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.map(deck => ({
          ...deck,
          sections: deck.sections.map(section => 
            section.id === sectionId 
              ? { ...section, flashcards: [...section.flashcards, newFlashcard] }
              : section
          )
        }))
      }))
    }));

    return newFlashcard;
  };

  const updateFlashcard = (flashcardId: string, question?: string, answer?: string, imageUrl?: string, imageMasks?: ImageMask[]) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.map(deck => ({
          ...deck,
          sections: deck.sections.map(section => ({
            ...section,
            flashcards: section.flashcards.map(card => 
              card.id === flashcardId 
                ? { 
                    ...card, 
                    question: question ?? card.question,
                    answer: answer ?? card.answer,
                    imageUrl: imageUrl ?? card.imageUrl,
                    imageMasks: imageMasks ?? card.imageMasks,
                    updatedAt: new Date()
                  }
                : card
            )
          }))
        }))
      }))
    }));
  };

  const deleteFlashcard = (flashcardId: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => ({
        ...file,
        decks: file.decks.map(deck => ({
          ...deck,
          sections: deck.sections.map(section => ({
            ...section,
            flashcards: section.flashcards.filter(card => card.id !== flashcardId)
          }))
        }))
      }))
    }));
  };

  const studyFlashcard = (flashcardId: string, response: 'again' | 'hard' | 'good' | 'easy', responseTime: number, isCorrect: boolean) => {
    const session: StudySession = {
      id: generateId(),
      flashcardId,
      response,
      responseTime,
      timestamp: new Date(),
      isCorrect,
    };

    setState(prev => {
      const newSessions = [...prev.sessions, session];
      
      return {
        ...prev,
        sessions: newSessions,
        files: prev.files.map(file => ({
          ...file,
          decks: file.decks.map(deck => ({
            ...deck,
            sections: deck.sections.map(section => ({
              ...section,
              flashcards: section.flashcards.map(card => 
                card.id === flashcardId 
                  ? { ...card, fsrsData: fsrsScheduler.review(card.fsrsData, response) }
                  : card
              )
            }))
          }))
        }))
      };
    });
  };

  const getDueCards = (): Flashcard[] => {
    const allCards: Flashcard[] = [];
    state.files.forEach(file => {
      file.decks.forEach(deck => {
        deck.sections.forEach(section => {
          allCards.push(...section.flashcards);
        });
      });
    });
    
    return fsrsScheduler.getDueCards(allCards.map(card => card.fsrsData))
      .map(fsrsData => allCards.find(card => card.fsrsData === fsrsData)!)
      .filter(Boolean);
  };

  const getCardsBySection = (sectionId: string): Flashcard[] => {
    for (const file of state.files) {
      for (const deck of file.decks) {
        const section = deck.sections.find(s => s.id === sectionId);
        if (section) return section.flashcards;
      }
    }
    return [];
  };

  const getStudyStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalCards = state.files.reduce((sum, file) => 
      sum + file.decks.reduce((deckSum, deck) => 
        deckSum + deck.sections.reduce((sectionSum, section) => 
          sectionSum + section.flashcards.length, 0), 0), 0);

    const todaySessions = state.sessions.filter(session => 
      new Date(session.timestamp) >= today);
    
    const studiedToday = todaySessions.length;
    const correctToday = todaySessions.filter(s => s.isCorrect).length;
    const accuracy = studiedToday > 0 ? Math.round((correctToday / studiedToday) * 100) : 0;

    // Calculate streak
    let streak = 0;
    const daysSorted = Array.from(new Set(
      state.sessions.map(s => new Date(s.timestamp).toDateString())
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (let i = 0; i < daysSorted.length; i++) {
      const dayTime = new Date(daysSorted[i]).getTime();
      const expectedDay = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)).toDateString();
      
      if (daysSorted[i] === expectedDay) {
        streak++;
      } else {
        break;
      }
    }

    // Weekly progress (last 7 days)
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayString = day.toDateString();
      const daySessions = state.sessions.filter(s => 
        new Date(s.timestamp).toDateString() === dayString);
      return daySessions.length;
    }).reverse();

    return {
      totalCards,
      studiedToday,
      accuracy,
      streak,
      weeklyProgress,
    };
  };

  const getPerformanceData = (deckId: string) => {
    const deckSessions = state.sessions.filter(session => {
      // Find flashcard by session.flashcardId and check if it belongs to the deck
      for (const file of state.files) {
        for (const deck of file.decks) {
          if (deck.id === deckId) {
            for (const section of deck.sections) {
              if (section.flashcards.some(card => card.id === session.flashcardId)) {
                return true;
              }
            }
          }
        }
      }
      return false;
    });

    const recentSessions = deckSessions.filter(session => 
      new Date().getTime() - new Date(session.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length;

    const correctSessions = deckSessions.filter(s => s.isCorrect).length;
    const averageAccuracy = deckSessions.length > 0 ? (correctSessions / deckSessions.length) * 100 : 50;
    
    // Calculate difficulty based on average response
    const responseValues = { again: 1, hard: 2, good: 3, easy: 4 };
    const avgResponse = deckSessions.length > 0 
      ? deckSessions.reduce((sum, s) => sum + responseValues[s.response], 0) / deckSessions.length
      : 2.5;
    const difficulty = (4 - avgResponse) / 3 * 100; // Convert to 0-100 scale

    return {
      averageAccuracy: Math.round(averageAccuracy),
      recentSessions,
      difficulty: Math.round(difficulty),
    };
  };

  const createExam = (name: string, date: Date, fileIds: string[], deckIds: string[]): Exam => {
    const selectedFiles = state.files.filter(f => fileIds.includes(f.id));
    const primaryColor = selectedFiles.length > 0 ? selectedFiles[0].color : FILE_COLORS[0];

    const newExam: Exam = {
      id: generateId(),
      name,
      date,
      fileIds,
      deckIds,
      color: primaryColor,
      studyPlan: [],
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      exams: [...prev.exams, newExam]
    }));

    // Generate initial schedule
    setTimeout(() => generateStudySchedule(newExam.id), 0);

    return newExam;
  };

  const updateExam = (examId: string, updates: Partial<Exam>) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.map(exam => 
        exam.id === examId ? { ...exam, ...updates } : exam
      )
    }));
  };

  const deleteExam = (examId: string) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.filter(exam => exam.id !== examId)
    }));
  };

  const generateStudySchedule = (examId: string) => {
    const exam = state.exams.find(e => e.id === examId);
    if (!exam) return;

    const today = new Date();
    const examDate = new Date(exam.date);
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExam <= 0) return;

    const schedule: StudySchedule[] = [];
    const selectedDecks = state.files
      .flatMap(file => file.decks)
      .filter(deck => exam.deckIds.includes(deck.id));

    // Calculate total content and performance data
    let totalSections = 0;
    const deckPerformance: Record<string, number> = {};
    
    selectedDecks.forEach(deck => {
      totalSections += deck.sections.length;
      const perfData = getPerformanceData(deck.id);
      deckPerformance[deck.id] = perfData.averageAccuracy;
    });

    // Determine study frequency based on content and performance
    const averagePerformance = Object.values(deckPerformance).reduce((sum, acc) => sum + acc, 0) / selectedDecks.length || 50;
    const baseSessionsPerWeek = averagePerformance < 60 ? 6 : averagePerformance < 80 ? 4 : 3;
    const totalSessionsNeeded = Math.max(Math.ceil(totalSections * 1.5), Math.ceil(daysUntilExam * baseSessionsPerWeek / 7));

    // Distribute sessions across available days
    const sessionDates: Date[] = [];
    const sessionInterval = Math.max(1, Math.floor(daysUntilExam / totalSessionsNeeded));
    
    for (let i = 0; i < totalSessionsNeeded && sessionDates.length < daysUntilExam - 1; i++) {
      const daysFromToday = Math.min(i * sessionInterval + 1, daysUntilExam - 1);
      const sessionDate = new Date(today.getTime() + daysFromToday * 24 * 60 * 60 * 1000);
      sessionDates.push(sessionDate);
    }

    // Assign content to sessions, prioritizing weaker decks
    const sortedDecks = selectedDecks.sort((a, b) => 
      (deckPerformance[a.id] || 50) - (deckPerformance[b.id] || 50)
    );

    sessionDates.forEach((date, index) => {
      const deckIndex = index % sortedDecks.length;
      const deck = sortedDecks[deckIndex];
      const sectionsPerSession = Math.max(1, Math.ceil(deck.sections.length / Math.ceil(sessionDates.length / sortedDecks.length)));
      const startSection = Math.floor((index / sortedDecks.length)) * sectionsPerSession;
      const endSection = Math.min(startSection + sectionsPerSession, deck.sections.length);
      
      const sectionIds = deck.sections.slice(startSection, endSection).map(s => s.id);
      
      if (sectionIds.length > 0) {
        schedule.push({
          date,
          deckId: deck.id,
          sectionIds,
          estimatedMinutes: sectionIds.length * 15, // 15 minutes per section
          completed: false,
          skipped: false,
        });
      }
    });

    updateExam(examId, { studyPlan: schedule });
  };

  const updateStudyProgress = (
    examId: string, 
    date: Date, 
    deckId: string, 
    completed: boolean, 
    actualMinutes?: number, 
    completionPercentage?: number, 
    skipped: boolean = false
  ) => {
    const exam = state.exams.find(e => e.id === examId);
    if (!exam) return;

    const dateString = date.toDateString();
    const updatedPlan = exam.studyPlan.map(session => {
      if (session.date.toDateString() === dateString && session.deckId === deckId) {
        return {
          ...session,
          completed,
          actualMinutes,
          completionPercentage,
          skipped,
        };
      }
      return session;
    });

    updateExam(examId, { studyPlan: updatedPlan });

    // Regenerate schedule after progress update
    setTimeout(() => generateStudySchedule(examId), 100);
  };

  const value: DataStoreContextType = {
    ...state,
    createFile,
    deleteFile,
    setCurrentFile,
    updateFileColor,
    createDeck,
    deleteDeck,
    setCurrentDeck,
    createSection,
    deleteSection,
    setCurrentSection,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    studyFlashcard,
    getDueCards,
    getCardsBySection,
    getStudyStats,
    getPerformanceData,
    createExam,
    updateExam,
    deleteExam,
    updateStudyProgress,
    generateStudySchedule,
  };

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within DataStoreProvider');
  }
  return context;
}