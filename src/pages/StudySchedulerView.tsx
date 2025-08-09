import { StudyCalendar } from '@/components/StudyCalendar';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { AssessmentDialog } from '@/components/AssessmentDialog';
import { PreferencesDialog } from '@/components/PreferencesDialog';

export default function StudySchedulerView() {
  const [assessOpen, setAssessOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);

  // Basic SEO
  useEffect(() => {
    document.title = 'Study Scheduler | Optimized Study Plan';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'AI-powered study scheduling with daily check-ins, customizable hours, and topic weighting.');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <FirstVisitTooltip
        page="schedule"
        title="Dynamic Study Scheduler"
        description="Create assessments and let our AI generate an optimal study schedule. Track your progress with our intelligent calendar system that adapts based on your performance."
      />

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Study Scheduler</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered study planning that adapts to your progress
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => setAssessOpen(true)}>Add Assessment</Button>
          <Button variant="outline" onClick={() => setPrefOpen(true)}>Preferences</Button>
        </div>
      </div>

      {/* Study Calendar */}
      <StudyCalendar />

      <AssessmentDialog open={assessOpen} onOpenChange={setAssessOpen} />
      <PreferencesDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </div>
  );
}