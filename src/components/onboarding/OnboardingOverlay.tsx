import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, FileText, BookOpen, Calendar, Edit3, Upload, Brain } from 'lucide-react';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';

const stepConfig = {
  'create-file': {
    title: 'Create Your First Course',
    description: 'You must create a course file to start. All other features are disabled until you complete this step.',
    icon: FileText,
    instruction: 'Click "Create File" button and enter a course name',
    progress: 1,
    isBlocking: true
  },
  'create-deck': {
    title: 'Add Your First Lecture Module',
    description: 'Now create a lecture module (deck) to organize your study materials by week or topic.',
    icon: BookOpen,
    instruction: 'Click "Add Lecture Module" and give it a name',
    progress: 2,
    isBlocking: true
  },
  'choose-flashcard-mode': {
    title: 'Choose How to Create Flashcards',
    description: 'You can either upload lecture materials for AI generation or create cards manually.',
    icon: Upload,
    instruction: 'Choose "Upload Lecture Notes" or "Create Custom Flashcard"',
    progress: 3,
    isBlocking: true
  },
  'edit-generated-cards': {
    title: 'Review & Edit Your Cards',
    description: 'Review each generated flashcard and make any necessary edits before saving.',
    icon: Edit3,
    instruction: 'Edit each card and click "Save & Next" to continue',
    progress: 4,
    isBlocking: true
  }
};

export function OnboardingOverlay() {
  const { currentStep, isOnboardingActive, isBlockingUI, nextStep, completeOnboarding } = useOnboarding();

  if (!isOnboardingActive || currentStep === 'completed') {
    return null;
  }

  const config = stepConfig[currentStep];
  const Icon = config.icon;
  const totalSteps = Object.keys(stepConfig).length;
  const progressPercentage = (config.progress / totalSteps) * 100;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isBlockingUI ? 'bg-black/80' : 'bg-black/50'}`}>
      <Card className="w-full max-w-md mx-auto border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center border border-red-200 dark:border-red-800">
            <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl text-red-900 dark:text-red-100">{config.title}</CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{config.progress} of {totalSteps}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-bold text-red-800 dark:text-red-200">
              🚫 Required Step: {config.instruction}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              All other app features are disabled until you complete this step.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs border-red-200 text-red-700">
              Required Step {config.progress}
            </Badge>
            
            <div className="text-xs text-red-600 dark:text-red-400">
              Complete the highlighted action above
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}