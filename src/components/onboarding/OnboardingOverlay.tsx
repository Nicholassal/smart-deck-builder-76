import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, FileText, BookOpen, Calendar, Edit3, Upload, Brain } from 'lucide-react';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';

const stepConfig = {
  'create-file': {
    title: 'Create Your Course',
    description: 'Start by creating a course file (e.g., "Calculus II") to organize your semester',
    icon: FileText,
    instruction: 'Click "Create File" to create your first course',
    progress: 1
  },
  'create-deck': {
    title: 'Add a Lecture Module',
    description: 'Create lecture modules to organize materials by week or topic',
    icon: BookOpen,
    instruction: 'Click "Add Lecture Module" to create your first lecture',
    progress: 2
  },
  'create-section': {
    title: 'Create a Lecture Section',
    description: 'Add specific lecture sections within each module',
    icon: Calendar,
    instruction: 'Click "Create First Lecture" to add your first lecture section',
    progress: 3
  },
  'upload-document': {
    title: 'Upload Lecture Materials',
    description: 'Upload PDFs, notes, or images to automatically generate flashcards',
    icon: Upload,
    instruction: 'Click "Upload Lecture Notes" to generate flashcards from your materials',
    progress: 4
  },
  'create-manual-flashcard': {
    title: 'Create Custom Flashcards',
    description: 'Add your own custom flashcards for additional study materials',
    icon: Edit3,
    instruction: 'Click "Create Custom Flashcard" to add manual flashcards',
    progress: 5
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{config.progress} of {totalSteps}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="p-4 bg-primary-light rounded-lg">
            <p className="text-sm font-medium text-primary-dark">
              {config.instruction}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              Step {config.progress}
            </Badge>
            
            {currentStep === 'create-manual-flashcard' ? (
              <Button onClick={completeOnboarding} className="bg-primary hover:bg-primary-dark">
                Finish Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={nextStep} className="bg-primary hover:bg-primary-dark">
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}