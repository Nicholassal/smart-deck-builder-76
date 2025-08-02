import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type OnboardingStep = 
  | 'create-file'
  | 'create-deck' 
  | 'create-section'
  | 'upload-document'
  | 'create-manual-flashcard'
  | 'completed';

export type TutorialType = 'analytics' | 'scheduling';

interface OnboardingState {
  currentStep: OnboardingStep;
  isOnboardingActive: boolean;
  completedTutorials: TutorialType[];
  createdFileId?: string;
  createdDeckId?: string;
  createdSectionId?: string;
}

interface OnboardingContextType extends OnboardingState {
  nextStep: () => void;
  completeOnboarding: () => void;
  markTutorialComplete: (tutorial: TutorialType) => void;
  shouldShowTutorial: (tutorial: TutorialType) => boolean;
  setCreatedIds: (fileId?: string, deckId?: string, sectionId?: string) => void;
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
        isOnboardingActive: parsed.isOnboardingActive !== false && parsed.currentStep !== 'completed',
        completedTutorials: parsed.completedTutorials || [],
        createdFileId: parsed.createdFileId,
        createdDeckId: parsed.createdDeckId,
        createdSectionId: parsed.createdSectionId,
      };
    }
    return {
      currentStep: 'create-file',
      isOnboardingActive: true,
      completedTutorials: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const nextStep = () => {
    const steps: OnboardingStep[] = [
      'create-file',
      'create-deck',
      'create-section', 
      'upload-document',
      'create-manual-flashcard',
      'completed'
    ];
    
    const currentIndex = steps.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    
    setState(prev => ({
      ...prev,
      currentStep: steps[nextIndex],
      isOnboardingActive: steps[nextIndex] !== 'completed'
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      currentStep: 'completed',
      isOnboardingActive: false
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

  const setCreatedIds = (fileId?: string, deckId?: string, sectionId?: string) => {
    setState(prev => ({
      ...prev,
      createdFileId: fileId || prev.createdFileId,
      createdDeckId: deckId || prev.createdDeckId,
      createdSectionId: sectionId || prev.createdSectionId,
    }));
  };

  const value: OnboardingContextType = {
    ...state,
    nextStep,
    completeOnboarding,
    markTutorialComplete,
    shouldShowTutorial,
    setCreatedIds,
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