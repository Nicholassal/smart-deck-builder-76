import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudyFile, Deck, Section, Flashcard, StudySession, EditSession } from '@/types/flashcard';
import { fsrsScheduler } from '@/lib/fsrs';

interface DataStoreState {
  files: StudyFile[];
  sessions: StudySession[];
  editSessions: EditSession[];
  currentFile: StudyFile | null;
  currentDeck: Deck | null;
  currentSection: Section | null;
}

interface DataStoreContextType extends DataStoreState {
  // File operations
  createFile: (name: string, semester?: string, year?: number) => StudyFile;
  deleteFile: (fileId: string) => void;
  setCurrentFile: (file: StudyFile | null) => void;
  
  // Deck operations
  createDeck: (fileId: string, name: string, courseName?: string) => Deck;
  deleteDeck: (deckId: string) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  
  // Section operations
  createSection: (deckId: string, name: string, week?: number) => Section;
  deleteSection: (sectionId: string) => void;
  setCurrentSection: (section: Section | null) => void;
  
  // Flashcard operations
  createFlashcard: (sectionId: string, question: string, answer: string, difficulty?: 'easy' | 'medium' | 'hard') => Flashcard;
  updateFlashcard: (flashcardId: string, question?: string, answer?: string, imageUrl?: string) => void;
  deleteFlashcard: (flashcardId: string) => void;
  
  // Study operations
  studyFlashcard: (flashcardId: string, response: 'again' | 'hard' | 'good' | 'easy', responseTime: number, isCorrect: boolean) => void;
  getDueCards: () => Flashcard[];
  getCardsBySection: (sectionId: string) => Flashcard[];
  
  // Statistics
  getStudyStats: () => {
    totalCards: number;
    studiedToday: number;
    accuracy: number;
    streak: number;
    weeklyProgress: number[];
  };
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

const STORAGE_KEY = 'studycards-data';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataStoreState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          files: parsed.files || [],
          sessions: parsed.sessions || [],
          editSessions: parsed.editSessions || [],
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
    }));
  }, [state.files, state.sessions, state.editSessions]);

  const createFile = (name: string, semester?: string, year?: number): StudyFile => {
    const newFile: StudyFile = {
      id: generateId(),
      name,
      decks: [],
      createdAt: new Date(),
      semester,
      year,
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

  const setCurrentFile = (file: StudyFile | null) => {
    setState(prev => ({ ...prev, currentFile: file, currentDeck: null, currentSection: null }));
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

  const createFlashcard = (sectionId: string, question: string, answer: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Flashcard => {
    const newFlashcard: Flashcard = {
      id: generateId(),
      question,
      answer,
      sectionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty,
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

  const updateFlashcard = (flashcardId: string, question?: string, answer?: string, imageUrl?: string) => {
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

  const value: DataStoreContextType = {
    ...state,
    createFile,
    deleteFile,
    setCurrentFile,
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