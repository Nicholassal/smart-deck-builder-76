import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudyScheduler } from '@/hooks/useStudyScheduler';
import { StudySessionForm } from '@/types/study';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  deckId: string | null;
}

export const StudySessionDialog = ({ 
  open, 
  onOpenChange, 
  date, 
  deckId 
}: StudySessionDialogProps) => {
  const { markDayStudied, markDaySkipped, getStudyBlocksForDate } = useStudyScheduler();
  const [actualMinutes, setActualMinutes] = useState('');
  const [correctCards, setCorrectCards] = useState('');
  const [totalCards, setTotalCards] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkStudied = async () => {
    if (!date || !deckId) return;
    
    setIsSubmitting(true);
    try {
      const session: StudySessionForm = {
        deck_id: deckId,
        actual_minutes: parseInt(actualMinutes) || 0,
        correct_cards: parseInt(correctCards) || 0,
        total_cards: parseInt(totalCards) || 0
      };
      
      const dateStr = format(date, 'yyyy-MM-dd');
      await markDayStudied(dateStr, deckId, session);
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to mark day as studied:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkSkipped = async () => {
    if (!date || !deckId) return;
    
    setIsSubmitting(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      await markDaySkipped(dateStr, deckId);
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to mark day as skipped:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setActualMinutes('');
    setCorrectCards('');
    setTotalCards('');
  };

  const blocks = date ? getStudyBlocksForDate(date) : [];
  const currentBlock = blocks.find(block => block.deck_id === deckId);

  if (!date || !deckId || !currentBlock) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Study Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 border rounded-lg bg-muted/50">
            <div className="font-medium">{currentBlock.deck_name || 'Study Deck'}</div>
            <div className="text-sm text-muted-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Target: {currentBlock.target_minutes} minutes
            </div>
          </div>

          {currentBlock.status === 'pending' && (
            <>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="actualMinutes">Minutes Studied</Label>
                  <Input
                    id="actualMinutes"
                    type="number"
                    placeholder="Enter minutes studied..."
                    value={actualMinutes}
                    onChange={(e) => setActualMinutes(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="correctCards">Correct Cards (Optional)</Label>
                  <Input
                    id="correctCards"
                    type="number"
                    placeholder="Number of cards answered correctly..."
                    value={correctCards}
                    onChange={(e) => setCorrectCards(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="totalCards">Total Cards Reviewed (Optional)</Label>
                  <Input
                    id="totalCards"
                    type="number"
                    placeholder="Total cards reviewed..."
                    value={totalCards}
                    onChange={(e) => setTotalCards(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleMarkStudied}
                  disabled={isSubmitting || !actualMinutes}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Studied
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleMarkSkipped}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Skip Session
                </Button>
              </div>
            </>
          )}

          {currentBlock.status === 'studied' && (
            <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-medium text-green-700 dark:text-green-300">
                Session Completed!
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                You studied for {currentBlock.actual_minutes || 0} minutes
              </div>
            </div>
          )}

          {currentBlock.status === 'skipped' && (
            <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="font-medium text-red-700 dark:text-red-300">
                Session Skipped
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                This session has been rescheduled to another day
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};