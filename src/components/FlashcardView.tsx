import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, RotateCcw } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface FlashcardViewProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onEdit?: (field: 'question' | 'answer', value: string) => void;
  mode: 'study' | 'edit' | 'review';
  showDifficulty?: boolean;
}

export function FlashcardView({ 
  flashcard, 
  isFlipped, 
  onFlip, 
  onEdit, 
  mode, 
  showDifficulty = false 
}: FlashcardViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<'question' | 'answer'>('question');
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: 'question' | 'answer') => {
    setEditField(field);
    setEditValue(field === 'question' ? flashcard.question : flashcard.answer);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(editField, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card 
        className={cn(
          "min-h-[300px] cursor-pointer transition-all duration-300 transform",
          isFlipped && "scale-y-[-1]",
          "bg-card border-border hover:shadow-lg"
        )}
        onClick={() => !isEditing && onFlip()}
      >
        <CardContent className="p-8 h-full flex flex-col justify-center">
          {showDifficulty && (
            <div className="flex justify-between items-center mb-4">
              <Badge 
                variant={
                  flashcard.difficulty === 'easy' ? 'default' : 
                  flashcard.difficulty === 'medium' ? 'secondary' : 
                  'destructive'
                }
              >
                {flashcard.difficulty}
              </Badge>
              <Badge variant="outline">
                {flashcard.fsrsData.reps} reviews
              </Badge>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Editing {editField}:
              </div>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[120px] resize-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn("space-y-6", isFlipped && "scale-y-[-1]")}>
              <div className="relative group">
                <h3 className="text-sm text-muted-foreground mb-2">
                  {isFlipped ? 'Answer' : 'Question'}
                </h3>
                <div className="text-lg leading-relaxed min-h-[80px] flex items-center">
                  {isFlipped ? flashcard.answer : flashcard.question}
                </div>
                
                {mode === 'edit' && !isFlipped && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit('question');
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                
                {mode === 'edit' && isFlipped && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit('answer');
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {!isFlipped && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Show Answer
                  </Button>
                </div>
              )}
            </div>
          )}

          {flashcard.imageUrl && (
            <div className="mt-4">
              <img 
                src={flashcard.imageUrl} 
                alt="Flashcard visual"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}