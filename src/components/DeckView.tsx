import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Upload, BookOpen, FolderPlus, Edit, Trash2 } from 'lucide-react';
import { Deck, Section } from '@/types/flashcard';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';
import { LectureUploader } from '@/components/LectureUploader';
import { FlashcardCreator } from '@/components/FlashcardCreator';

interface DeckViewProps {
  deck: Deck;
  onBack: () => void;
}

export function DeckView({ deck, onBack }: DeckViewProps) {
  const [showLectureUploader, setShowLectureUploader] = useState(false);
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false);
  const [showFlashcardCreator, setShowFlashcardCreator] = useState(false);

  const { getDueCards } = useDataStore();

  const getTotalFlashcards = () => {
    return deck.sections.reduce((total, section) => total + section.flashcards.length, 0);
  };

  const getDueFlashcards = () => {
    const dueCards = getDueCards();
    return deck.sections.reduce((total, section) => {
      const sectionDue = dueCards.filter(card => 
        section.flashcards.some(c => c.id === card.id)
      ).length;
      return total + sectionDue;
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            {deck.courseName && (
              <p className="text-muted-foreground">{deck.courseName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Deck Stats */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total flashcards</p>
            <p className="text-2xl font-bold">{getTotalFlashcards()}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Due for review</p>
            <p className="text-2xl font-bold text-destructive">{getDueFlashcards()}</p>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowLectureUploader(true)}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload Notes</h3>
              <p className="text-sm text-muted-foreground">
                Upload PDF, DOCX, or text files to generate flashcards automatically
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowFlashcardCreator(true)}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
              <Edit className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create Manually</h3>
              <p className="text-sm text-muted-foreground">
                Create your own flashcards from scratch with custom questions and answers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Flashcards */}
      {getTotalFlashcards() > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Flashcards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deck.sections.map((section) => 
              section.flashcards.map((flashcard) => (
                <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm line-clamp-2">{flashcard.question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{flashcard.answer}</p>
                      <Badge variant="outline" className="text-xs">
                        {flashcard.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lecture Uploader */}
      {showLectureUploader && (
        <LectureUploader 
          sectionId={deck.id}
          onClose={() => setShowLectureUploader(false)}
        />
      )}

      {/* Flashcard Creator */}
      {showFlashcardCreator && (
        <FlashcardCreator 
          deckId={deck.id}
          onClose={() => setShowFlashcardCreator(false)}
        />
      )}
    </div>
  );
}