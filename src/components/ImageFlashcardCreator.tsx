import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Save, Plus, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';
import { ImageMaskEditor } from './ImageMaskEditor';
import { ImageMask } from '@/types/flashcard';

interface ImageFlashcardCreatorProps {
  deckId: string;
  onClose: () => void;
}

interface ImageFlashcardDraft {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  imageMasks?: ImageMask[];
}

export function ImageFlashcardCreator({ deckId, onClose }: ImageFlashcardCreatorProps) {
  const [cards, setCards] = useState<ImageFlashcardDraft[]>([
    { question: '', answer: '', difficulty: 'medium' }
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createFlashcard } = useDataStore();
  const { toast } = useToast();

  const currentCard = cards[currentCardIndex];
  const isCurrentCardValid = currentCard.answer.trim() && currentCard.imageUrl;

  const updateCurrentCard = (updates: Partial<ImageFlashcardDraft>) => {
    setCards(prev => prev.map((card, index) => 
      index === currentCardIndex ? { ...card, ...updates } : card
    ));
  };

  const handleSaveCard = () => {
    if (!isCurrentCardValid) {
      toast({ 
        title: "Error", 
        description: "Please add an answer and upload an image", 
        variant: "destructive" 
      });
      return;
    }

    const sectionId = deckId;
    
    createFlashcard(
      sectionId, 
      currentCard.question.trim(), 
      currentCard.answer.trim(), 
      currentCard.difficulty,
      currentCard.imageUrl,
      currentCard.imageMasks
    );
    
    toast({ title: "Image Flashcard Saved", description: "New image flashcard has been created!" });
    
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
        currentCard.difficulty,
        currentCard.imageUrl,
        currentCard.imageMasks
      );
      toast({ title: "Final Image Flashcard Saved", description: "All image flashcards have been created!" });
    }
    
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateCurrentCard({ imageUrl, imageMasks: [] });
    };
    reader.readAsDataURL(file);
  };

  const handleMasksUpdate = (masks: ImageMask[]) => {
    updateCurrentCard({ imageMasks: masks });
    setShowImageEditor(false);
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
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Type Selection
              </Button>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Create Image Flashcards</h2>
                <Badge variant="outline">
                  Card {currentCardIndex + 1} of {cards.length}
                </Badge>
              </div>
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
            {/* Image Upload - Primary Focus */}
            <div>
              <Label className="text-lg font-semibold">Image *</Label>
              <div className="mt-2">
                {currentCard.imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative max-w-md mx-auto">
                      <img 
                        src={currentCard.imageUrl} 
                        alt="Flashcard" 
                        className="w-full rounded-lg border shadow-md"
                      />
                      {currentCard.imageMasks && currentCard.imageMasks.length > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">
                            {currentCard.imageMasks.length} mask(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageEditor(true)}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add/Edit Masks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCurrentCard({ imageUrl: undefined, imageMasks: [] })}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-primary/25 rounded-lg p-8 text-center bg-primary/5">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Upload an Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an image that you want to create questions about. You can add masks to hide parts of the image.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Question */}
            <div>
              <Label htmlFor="question">Question (Optional)</Label>
              <Textarea
                id="question"
                placeholder="Optional: Add a question about this image"
                value={currentCard.question}
                onChange={(e) => updateCurrentCard({ question: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Answer */}
            <div>
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="What is the correct answer or explanation?"
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
                {isCurrentCardValid ? "Ready to save" : "Add image and answer to save"}
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

      {/* Image Mask Editor */}
      {showImageEditor && currentCard.imageUrl && (
        <ImageMaskEditor
          imageUrl={currentCard.imageUrl}
          masks={currentCard.imageMasks || []}
          onMasksChange={handleMasksUpdate}
          onClose={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}