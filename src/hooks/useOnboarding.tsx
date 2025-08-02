import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OnboardingStep = 
  | 'create-file'
  | 'create-deck' 
  | 'choose-flashcard-mode'
  | 'edit-generated-cards'
  | 'completed';

export type TutorialType = 'stats' | 'schedule' | 'settings';

export type FirstVisitPage = 'stats' | 'schedule' | 'settings';

interface FlashcardEdit {
  cardId: string;
  originalQuestion: string;
  originalAnswer: string;
  editedQuestion: string;
  editedAnswer: string;
  timestamp: number;
}

interface OnboardingState {
  currentStep: OnboardingStep;
  isOnboardingActive: boolean;
  seenOnboarding: boolean;
  isBlockingUI: boolean;
  completedTutorials: TutorialType[];
  firstVisitDismissals: FirstVisitPage[];
  createdFileId?: string;
  createdDeckId?: string;
  createdSectionId?: string;
  isEditMode: boolean;
  currentEditCards: any[];
  currentEditIndex: number;
  editLogs: FlashcardEdit[];
}

interface OnboardingContextType extends OnboardingState {
  nextStep: () => void;
  completeOnboarding: () => void;
  markTutorialComplete: (tutorial: TutorialType) => void;
  shouldShowTutorial: (tutorial: TutorialType) => boolean;
  dismissFirstVisit: (page: FirstVisitPage) => void;
  shouldShowFirstVisit: (page: FirstVisitPage) => boolean;
  setCreatedIds: (fileId?: string, deckId?: string, sectionId?: string) => void;
  startEditMode: (cards: any[]) => void;
  completeEditMode: () => void;
  nextEditCard: () => void;
  saveCurrentCard: (question: string, answer: string) => void;
  setBlockingUI: (blocking: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEY = 'studycards-onboarding';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        currentStep: parsed.currentStep || 'create-file',
        isOnboardingActive: parsed.isOnboardingActive !== false && parsed.currentStep !== 'completed' && !parsed.seenOnboarding,
        seenOnboarding: parsed.seenOnboarding || false,
        isBlockingUI: parsed.isBlockingUI || false,
        completedTutorials: parsed.completedTutorials || [],
        firstVisitDismissals: parsed.firstVisitDismissals || [],
        createdFileId: parsed.createdFileId,
        createdDeckId: parsed.createdDeckId,
        createdSectionId: parsed.createdSectionId,
        isEditMode: false,
        currentEditCards: [],
        currentEditIndex: 0,
        editLogs: parsed.editLogs || [],
      };
    }
    return {
      currentStep: 'create-file',
      isOnboardingActive: true,
      seenOnboarding: false,
      isBlockingUI: true,
      completedTutorials: [],
      firstVisitDismissals: [],
      isEditMode: false,
      currentEditCards: [],
      currentEditIndex: 0,
      editLogs: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const nextStep = () => {
    const steps: OnboardingStep[] = [
      'create-file',
      'create-deck',
      'choose-flashcard-mode',
      'edit-generated-cards',
      'completed'
    ];
    
    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    
    setState(prev => ({
      ...prev,
      currentStep: steps[nextIndex],
      isOnboardingActive: steps[nextIndex] !== 'completed',
      isBlockingUI: steps[nextIndex] !== 'completed'
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'completed',
      isOnboardingActive: false,
      seenOnboarding: true,
      isBlockingUI: false
    }));
  };

  const markTutorialComplete = (tutorial: TutorialType) => {
    setState(prev => ({
      ...prev,
      completedTutorials: [...prev.completedTutorials, tutorial]
    }));
  };

  const shouldShowTutorial = (tutorial: TutorialType) => {
    return !state.completedTutorials.includes(tutorial) && !state.isOnboardingActive;
  };

  const dismissFirstVisit = (page: FirstVisitPage) => {
    setState(prev => ({
      ...prev,
      firstVisitDismissals: [...prev.firstVisitDismissals, page]
    }));
  };

  const shouldShowFirstVisit = (page: FirstVisitPage) => {
    return !state.firstVisitDismissals.includes(page) && state.seenOnboarding;
  };

  const setCreatedIds = (fileId?: string, deckId?: string, sectionId?: string) => {
    setState(prev => ({
      ...prev,
      createdFileId: fileId || prev.createdFileId,
      createdDeckId: deckId || prev.createdDeckId,
      createdSectionId: sectionId || prev.createdSectionId,
    }));
  };

  const startEditMode = (cards: any[]) => {
    setState(prev => ({
      ...prev,
      isEditMode: true,
      currentEditCards: cards,
      currentEditIndex: 0
    }));
  };

  const completeEditMode = () => {
    setState(prev => ({
      ...prev,
      isEditMode: false,
      currentEditCards: [],
      currentEditIndex: 0
    }));
  };

  const nextEditCard = () => {
    setState(prev => ({
      ...prev,
      currentEditIndex: prev.currentEditIndex + 1
    }));
  };

  const saveCurrentCard = (question: string, answer: string) => {
    const currentCard = state.currentEditCards[state.currentEditIndex];
    if (currentCard) {
      const edit: FlashcardEdit = {
        cardId: currentCard.id,
        originalQuestion: currentCard.question,
        originalAnswer: currentCard.answer,
        editedQuestion: question,
        editedAnswer: answer,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        editLogs: [...prev.editLogs, edit],
        currentEditCards: prev.currentEditCards.map((card, index) => 
          index === prev.currentEditIndex 
            ? { ...card, question, answer }
            : card
        )
      }));
    }
  };

  const setBlockingUI = (blocking: boolean) => {
    setState(prev => ({
      ...prev,
      isBlockingUI: blocking
    }));
  };

  const value: OnboardingContextType = {
    ...state,
    nextStep,
    completeOnboarding,
    markTutorialComplete,
    shouldShowTutorial,
    dismissFirstVisit,
    shouldShowFirstVisit,
    setCreatedIds,
    startEditMode,
    completeEditMode,
    nextEditCard,
    saveCurrentCard,
    setBlockingUI,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}