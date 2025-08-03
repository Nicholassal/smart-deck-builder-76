import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Save } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';

interface FlashcardCreatorProps {
  deckId: string;
  onClose: () => void;
}

interface FlashcardDraft {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function FlashcardCreator({ deckId, onClose }: FlashcardCreatorProps) {
  const [cards, setCards] = useState<FlashcardDraft[]>([
    { question: '', answer: '', difficulty: 'medium' }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const { createFlashcard } = useDataStore();
  const { toast } = useToast();

  const currentCard = cards[currentCardIndex];
  const isCurrentCardValid = currentCard.question.trim() && currentCard.answer.trim();

  const updateCurrentCard = (updates: Partial<FlashcardDraft>) => {
    setCards(prev => prev.map((card, index) => 
      index === currentCardIndex ? { ...card, ...updates } : card
    ));
  };

  const handleSaveCard = () => {
    if (!isCurrentCardValid) {
      toast({ title: "Error", description: "Please fill in both question and answer", variant: "destructive" });
      return;
    }

    // Find first section or use deck ID
    const sectionId = deckId; // Using deck ID as section ID as per existing logic
    
    createFlashcard(
      sectionId, 
      currentCard.question.trim(), 
      currentCard.answer.trim(), 
      currentCard.difficulty
    );
    
    toast({ title: "Flashcard Saved", description: "New flashcard has been created!" });
    
    // Add new empty card
    setCards(prev => [...prev, { question: '', answer: '', difficulty: 'medium' }]);
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleFinish = () => {
    // Save current card if it has content
    if (isCurrentCardValid) {
      const sectionId = deckId;
      createFlashcard(
        sectionId, 
        currentCard.question.trim(), 
        currentCard.answer.trim(), 
        currentCard.difficulty
      );
      toast({ title: "Final Flashcard Saved", description: "All flashcards have been created!" });
    }
    
    onClose();
  };


  const handleDeleteCard = (index: number) => {
    if (cards.length === 1) {
      // Reset to empty card
      setCards([{ question: '', answer: '', difficulty: 'medium' }]);
      setCurrentCardIndex(0);
    } else {
      setCards(prev => prev.filter((_, i) => i !== index));
      if (currentCardIndex >= index && currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Create Flashcards</h2>
              <Badge variant="outline">
                Card {currentCardIndex + 1} of {cards.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Navigation */}
          {cards.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {cards.map((card, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Button
                    variant={index === currentCardIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentCardIndex(index)}
                    className="min-w-16"
                  >
                    {index + 1}
                  </Button>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(index)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {/* Question */}
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the question or prompt..."
                value={currentCard.question}
                onChange={(e) => updateCurrentCard({ question: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Answer */}
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer or explanation..."
                value={currentCard.answer}
                onChange={(e) => updateCurrentCard({ answer: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>


            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={currentCard.difficulty} 
                onValueChange={(value: 'easy' | 'medium' | 'hard') => updateCurrentCard({ difficulty: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {isCurrentCardValid ? "Ready to save" : "Fill in question and answer to save"}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveCard}
                  disabled={!isCurrentCardValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & Continue
                </Button>
                <Button onClick={handleFinish}>
                  Finish
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}