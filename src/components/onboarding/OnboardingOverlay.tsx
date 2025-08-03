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
  const { currentStep, isOnboardingActive, nextStep, completeOnboarding } = useOnboarding();

  if (!isOnboardingActive || currentStep === 'completed') {
    return null;
  }

  const config = stepConfig[currentStep];
  const Icon = config.icon;
  const totalSteps = Object.keys(stepConfig).length;
  const progressPercentage = (config.progress / totalSteps) * 100;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold">{config.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={progressPercentage} className="h-1 flex-1" />
                <span className="text-xs text-muted-foreground">{config.progress}/{totalSteps}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-xs mb-3">
            {config.description}
          </CardDescription>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs font-medium text-primary">
              📍 {config.instruction}
            </p>
          </div>

          <div className="flex justify-between items-center mt-3">
            <Badge variant="outline" className="text-xs">
              Step {config.progress}
            </Badge>
            
            <div className="text-xs text-muted-foreground">
              Follow the highlighted area
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}