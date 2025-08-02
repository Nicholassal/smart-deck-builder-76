import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, RotateCcw, Save } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export function FlashcardEditMode() {
  const { 
    isEditMode, 
    currentEditCards, 
    currentEditIndex, 
    nextEditCard, 
    saveCurrentCard, 
    completeEditMode 
  } = useOnboarding();

  const [isFlipped, setIsFlipped] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!isEditMode || currentEditCards.length === 0) {
    return null;
  }

  const currentCard = currentEditCards[currentEditIndex];
  const isLastCard = currentEditIndex === currentEditCards.length - 1;
  const progress = ((currentEditIndex + 1) / currentEditCards.length) * 100;

  // Initialize edit fields when card changes
  if (currentCard && (editedQuestion !== currentCard.question || editedAnswer !== currentCard.answer)) {
    setEditedQuestion(currentCard.question);
    setEditedAnswer(currentCard.answer);
    setHasUnsavedChanges(false);
    setIsFlipped(false);
  }

  const handleQuestionChange = (value: string) => {
    setEditedQuestion(value);
    setHasUnsavedChanges(true);
  };

  const handleAnswerChange = (value: string) => {
    setEditedAnswer(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveCurrentCard(editedQuestion, editedAnswer);
    setHasUnsavedChanges(false);
    
    if (isLastCard) {
      completeEditMode();
    } else {
      nextEditCard();
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Card {currentEditIndex + 1} of {currentEditCards.length}
            </Badge>
            <CardTitle className="text-xl">Edit Generated Flashcard</CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="min-h-[300px] p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
            {!isFlipped ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Question (Front)</div>
                <Textarea
                  value={editedQuestion}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  placeholder="Edit the question..."
                  className="min-h-[120px] text-lg"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">Answer (Back)</div>
                <Textarea
                  value={editedAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Edit the answer..."
                  className="min-h-[120px] text-lg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleFlip}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {isFlipped ? 'Show Question' : 'Show Answer'}
            </Button>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              📝 Review and edit both sides before saving. You must save each card to continue.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges && "⚠️ Unsaved changes"}
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={hasUnsavedChanges && (editedQuestion.trim() === '' || editedAnswer.trim() === '')}
              className="bg-primary hover:bg-primary-dark"
            >
              {isLastCard ? (
                <>
                  Complete
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Save & Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}