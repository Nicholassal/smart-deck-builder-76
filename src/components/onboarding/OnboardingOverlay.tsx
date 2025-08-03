import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Upload, Edit3, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const welcomeSteps = [
  {
    title: 'Welcome to StudyCards!',
    description: 'Let\'s quickly walk through how to get started with your study materials.',
    icon: BookOpen,
    content: 'StudyCards helps you create and study flashcards from your lecture materials using AI-powered generation.'
  },
  {
    title: 'Create Study Files',
    description: 'Start by creating course files to organize your study materials.',
    icon: FileText,
    content: 'Click "Create File" to create a new course. You can organize by semester, subject, or however works best for you.'
  },
  {
    title: 'Add Lecture Modules',
    description: 'Within each course, create lecture modules (decks) for different topics or weeks.',
    icon: BookOpen,
    content: 'Each module can contain multiple flashcards related to a specific lecture or topic.'
  },
  {
    title: 'Upload & Generate Cards',
    description: 'Upload your PDF lecture notes and let AI generate flashcards automatically.',
    icon: Upload,
    content: 'Our AI will analyze your PDFs and create relevant flashcards. You can then review and edit them as needed.'
  },
  {
    title: 'Review & Edit',
    description: 'Review all generated flashcards and make any necessary edits before studying.',
    icon: Edit3,
    content: 'You can modify questions, answers, or create custom flashcards from scratch at any time.'
  }
];

export function OnboardingOverlay() {
  const { shouldShowWelcome, completeWelcome } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  if (!shouldShowWelcome) {
    return null;
  }

  const currentStepData = welcomeSteps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === welcomeSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeWelcome();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    completeWelcome();
  };

  return (
    <Dialog open={true} onOpenChange={handleSkip}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{currentStepData.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{currentStepData.content}</p>

          <div className="flex items-center space-x-2">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full flex-1 ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" onClick={handleSkip} className="text-sm">
              Skip Tutorial
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {welcomeSteps.length}
              </span>
              <Button onClick={handleNext} className="text-sm">
                {isLastStep ? 'Get Started' : 'Next'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}