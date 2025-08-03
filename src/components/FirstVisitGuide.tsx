import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, FileText, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useOnboarding, FirstVisitPage } from '@/hooks/useOnboarding';

interface FirstVisitGuideProps {
  page: FirstVisitPage;
}

const pageContent = {
  files: {
    title: 'Study Files & Organization',
    icon: FileText,
    description: 'This is where you manage all your study materials and course files.',
    features: [
      'Create new course files for different subjects',
      'Upload PDF lecture notes for AI flashcard generation',
      'Organize materials by semester and topic',
      'Search and filter through your study files'
    ]
  },
  stats: {
    title: 'Study Statistics & Progress',
    icon: BarChart3,
    description: 'Track your learning progress and study patterns over time.',
    features: [
      'View your study streak and consistency',
      'See detailed performance analytics',
      'Track which subjects need more attention',
      'Monitor your improvement over time'
    ]
  },
  schedule: {
    title: 'Study Scheduling & Reviews',
    icon: Calendar,
    description: 'Manage your study sessions and spaced repetition schedule.',
    features: [
      'See cards due for review today',
      'Schedule study sessions in advance',
      'Follow spaced repetition algorithms',
      'Track upcoming deadlines and exams'
    ]
  }
};

export function FirstVisitGuide({ page }: FirstVisitGuideProps) {
  const { shouldShowFirstVisit, markFirstVisitComplete } = useOnboarding();

  if (!shouldShowFirstVisit(page)) {
    return null;
  }

  const content = pageContent[page];
  const Icon = content.icon;

  const handleClose = () => {
    markFirstVisitComplete(page);
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{content.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{content.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">What you can do here:</h4>
            <ul className="space-y-2">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleClose}>
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}