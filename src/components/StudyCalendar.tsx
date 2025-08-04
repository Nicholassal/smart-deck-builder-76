import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { useStudyScheduler } from '@/hooks/useStudyScheduler';
import { StudySessionDialog } from './StudySessionDialog';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

interface StudyCalendarProps {
  onDateSelect?: (date: Date) => void;
}

export const StudyCalendar = ({ onDateSelect }: StudyCalendarProps) => {
  const {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    getStudyBlocksForDate,
    getUpcomingAssessments,
    loadStudyPlan,
    isLoading
  } = useStudyScheduler();

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Load study plan for current month
  useState(() => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    loadStudyPlan(start, end);
  });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
    
    const blocks = getStudyBlocksForDate(date);
    if (blocks.length > 0) {
      setSelectedDeckId(blocks[0].deck_id);
      setSessionDialogOpen(true);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'next' 
      ? addMonths(currentMonth, 1)
      : subMonths(currentMonth, 1);
    
    setCurrentMonth(newMonth);
    
    // Load study plan for new month
    const start = format(startOfMonth(newMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(newMonth), 'yyyy-MM-dd');
    loadStudyPlan(start, end);
  };

  const getDayModifiers = (date: Date) => {
    const blocks = getStudyBlocksForDate(date);
    const upcomingAssessments = getUpcomingAssessments();
    
    const isExamDay = upcomingAssessments.some(
      assessment => format(assessment.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    const hasStudyBlocks = blocks.length > 0;
    const isCompleted = blocks.every(block => block.status === 'studied');
    const isSkipped = blocks.some(block => block.status === 'skipped');
    
    return {
      isExamDay,
      hasStudyBlocks,
      isCompleted,
      isSkipped,
      blockCount: blocks.length
    };
  };

  const renderCalendarDay = (date: Date) => {
    const modifiers = getDayModifiers(date);
    const blocks = getStudyBlocksForDate(date);
    const totalMinutes = blocks.reduce((sum, block) => sum + block.target_minutes, 0);
    
    return (
      <div className="relative w-full h-full min-h-[60px] p-1">
        <div className="text-sm font-medium mb-1">{date.getDate()}</div>
        
        {modifiers.isExamDay && (
          <div className="absolute top-1 right-1">
            <Target className="h-3 w-3 text-destructive" />
          </div>
        )}
        
        {modifiers.hasStudyBlocks && (
          <div className="space-y-1">
            {blocks.slice(0, 2).map((block, index) => (
              <div
                key={`${block.deck_id}-${index}`}
                className="flex items-center gap-1 text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: block.color }}
                />
                <span className="truncate">{block.minutes}m</span>
                {block.status === 'studied' && (
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
                {block.status === 'skipped' && (
                  <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                )}
              </div>
            ))}
            
            {blocks.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{blocks.length - 2} more
              </div>
            )}
            
            <div className="text-xs text-muted-foreground font-medium">
              {totalMinutes}min total
            </div>
          </div>
        )}
      </div>
    );
  };

  const upcomingAssessments = getUpcomingAssessments();
  const selectedDateBlocks = selectedDate ? getStudyBlocksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Study Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange('prev')}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[120px] text-center font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMonthChange('next')}
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => date && handleDateClick(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{
              DayContent: ({ date }) => renderCalendarDay(date)
            }}
            className="w-full"
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* Upcoming Assessments */}
      {upcomingAssessments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Upcoming Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAssessments.map(assessment => (
                <div key={assessment.assessment_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{assessment.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(assessment.date, 'MMM d, yyyy')}
                    </div>
                  </div>
                  <Badge variant={assessment.weight > 1 ? 'default' : 'secondary'}>
                    Weight: {assessment.weight}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date Details */}
      {selectedDate && selectedDateBlocks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateBlocks.map((block, index) => (
                <div key={`${block.deck_id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: block.color }}
                    />
                    <div>
                      <div className="font-medium">{block.deck_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {block.minutes} minutes
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      block.status === 'studied' ? 'default' :
                      block.status === 'skipped' ? 'destructive' : 'secondary'
                    }
                  >
                    {block.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Session Dialog */}
      <StudySessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        date={selectedDate}
        deckId={selectedDeckId}
      />
    </div>
  );
};