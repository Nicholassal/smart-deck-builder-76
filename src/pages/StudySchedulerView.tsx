import { StudyCalendar } from '@/components/StudyCalendar';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function StudySchedulerView() {
  const { hasVisited, markAsVisited } = useOnboarding();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FirstVisitTooltip
        isVisible={!hasVisited('study-scheduler')}
        onClose={() => markAsVisited('study-scheduler')}
        title="Dynamic Study Scheduler"
        description="Create assessments and let our AI generate an optimal study schedule. Track your progress with our intelligent calendar system that adapts based on your performance."
      />

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Study Scheduler</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered study planning that adapts to your progress
        </p>
      </div>

      {/* Study Calendar */}
      <StudyCalendar />
    </div>
  );
}