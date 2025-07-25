import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Calendar, Target, TrendingUp } from 'lucide-react';
import { useOnboarding, TutorialType } from '@/hooks/useOnboarding';

interface TutorialOverlayProps {
  type: TutorialType;
}

const tutorialConfig = {
  analytics: {
    title: 'Analytics Dashboard',
    icon: BarChart3,
    steps: [
      {
        title: 'Success Rates',
        description: 'Track your accuracy per course and section to identify areas that need more focus.',
        icon: Target
      },
      {
        title: 'FSRS Predictions',
        description: 'See AI-predicted recall probabilities for each flashcard based on spaced repetition science.',
        icon: TrendingUp
      },
      {
        title: 'Exam Readiness',
        description: 'Monitor your confidence levels for upcoming exams and get study recommendations.',
        icon: Calendar
      }
    ]
  },
  scheduling: {
    title: 'Study Scheduler',
    icon: Calendar,
    steps: [
      {
        title: 'FSRS Algorithm',
        description: 'Your review schedule is optimized using the Free Spaced Repetition Scheduler for 90% retention.',
        icon: TrendingUp
      },
      {
        title: 'Daily Adjustments',
        description: 'Mark days as studied or skipped, and the algorithm will dynamically adjust your priorities.',
        icon: Calendar
      },
      {
        title: 'Exam Focus',
        description: 'Set exam dates and the scheduler will prioritize harder flashcards and weaker sections.',
        icon: Target
      }
    ]
  }
};

export function TutorialOverlay({ type }: TutorialOverlayProps) {
  const { shouldShowTutorial, markTutorialComplete } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!shouldShowTutorial(type)) {
    return null;
  }

  const config = tutorialConfig[type];
  const MainIcon = config.icon;
  const currentStepData = config.steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markTutorialComplete(type);
    }
  };

  const handleSkip = () => {
    markTutorialComplete(type);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <MainIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription>Learn how to make the most of this feature</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-secondary/20 rounded-full flex items-center justify-center">
              <StepIcon className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
          </div>

          <div className="flex justify-center space-x-2">
            {config.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            
            <Button onClick={handleNext} className="bg-primary hover:bg-primary-dark">
              {currentStep === config.steps.length - 1 ? 'Got it!' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}