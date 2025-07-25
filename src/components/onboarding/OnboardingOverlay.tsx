import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, FileText, BookOpen, Calendar, Edit3, Upload, Brain } from 'lucide-react';
import { useOnboarding, OnboardingStep } from '@/hooks/useOnboarding';

const stepConfig = {
  'create-file': {
    title: 'Create Your First Study File',
    description: 'Start by creating a file to organize your semester or academic year',
    icon: FileText,
    instruction: 'Click "New Study File" to create your first file (e.g., "Fall 2024")',
    progress: 1
  },
  'create-deck': {
    title: 'Add Your First Course',
    description: 'Create a deck to represent one of your courses',
    icon: BookOpen,
    instruction: 'Add a deck for your course (e.g., "Biology 101")',
    progress: 2
  },
  'create-section': {
    title: 'Create a Section',
    description: 'Organize your content by weekly lectures or chapters',
    icon: Calendar,
    instruction: 'Create your first section (e.g., "Week 1 Lecture")',
    progress: 3
  },
  'create-manual-flashcard': {
    title: 'Make Your First Flashcard',
    description: 'Learn the basics by creating a flashcard manually',
    icon: Edit3,
    instruction: 'Create at least one flashcard with a question and answer',
    progress: 4
  },
  'upload-document': {
    title: 'Upload Your First Document',
    description: 'Upload lecture slides or notes for AI-powered flashcard generation',
    icon: Upload,
    instruction: 'Upload a document to see AI magic in action',
    progress: 5
  },
  'ai-generation': {
    title: 'AI Flashcard Generation',
    description: 'Watch as AI automatically creates flashcards from your content',
    icon: Brain,
    instruction: 'Review the AI-generated flashcards',
    progress: 6
  },
  'initial-editing': {
    title: 'Edit & Review',
    description: 'Review and edit the AI-generated flashcards to make them perfect',
    icon: CheckCircle,
    instruction: 'Go through each flashcard and make any necessary edits',
    progress: 7
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
            
            {currentStep === 'initial-editing' ? (
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