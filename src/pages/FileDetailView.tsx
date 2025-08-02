import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, BookOpen, Play, Calendar, GraduationCap } from 'lucide-react';
import { StudyFile, Deck } from '@/types/flashcard';
import { useDataStore } from '@/hooks/useDataStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { StudySessionView } from '@/components/StudySessionView';
import { DeckView } from '@/components/DeckView';

interface FileDetailViewProps {
  file: StudyFile;
  onBack: () => void;
}

export function FileDetailView({ file, onBack }: FileDetailViewProps) {
  const [showCreateDeckDialog, setShowCreateDeckDialog] = useState(false);
  const [showStudyView, setShowStudyView] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckCourse, setNewDeckCourse] = useState('');

  const { createDeck, getDueCards, files } = useDataStore();
  const { setCreatedIds, nextStep, currentStep } = useOnboarding();
  const { toast } = useToast();

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      toast({ title: "Error", description: "Please enter a lecture name", variant: "destructive" });
      return;
    }

    const deck = createDeck(file.id, newDeckName.trim(), newDeckCourse.trim() || undefined);
    setCreatedIds(undefined, deck.id);
    
    if (currentStep === 'create-deck') {
      nextStep();
    }
    
    toast({ 
      title: "Lecture Module Created", 
      description: `"${newDeckName}" has been added to your course!` 
    });
    setShowCreateDeckDialog(false);
    setNewDeckName('');
    setNewDeckCourse('');
  };

  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeck(deck);
  };

  // Get current file data (in case it was updated)
  const currentFile = files.find(f => f.id === file.id) || file;

  const getDeckStats = (deck: Deck) => {
    const totalCards = deck.sections.reduce((sum, section) => sum + section.flashcards.length, 0);
    const dueCards = getDueCards().filter(card => 
      deck.sections.some(section => section.flashcards.some(c => c.id === card.id))
    );
    return { totalCards, dueCards: dueCards.length };
  };

  const startStudySession = () => {
    const dueCards = getDueCards().filter(card => 
      currentFile.decks.some(deck => 
        deck.sections.some(section => 
          section.flashcards.some(c => c.id === card.id)
        )
      )
    );
    
    if (dueCards.length === 0) {
      toast({ title: "No cards due", description: "No cards are due for review right now." });
      return;
    }
    
    setShowStudyView(true);
  };

  if (selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={() => setSelectedDeck(null)} />;
  }

  if (showStudyView) {
    const studyCards = getDueCards().filter(card => 
      currentFile.decks.some(deck => 
        deck.sections.some(section => 
          section.flashcards.some(c => c.id === card.id)
        )
      )
    );
    
    return (
      <StudySessionView 
        cards={studyCards}
        onBack={() => setShowStudyView(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Files
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-primary" />
              {currentFile.name}
            </h1>
            {currentFile.semester && (
              <p className="text-muted-foreground flex items-center ml-11">
                <Calendar className="h-4 w-4 mr-1" />
                {currentFile.semester} {currentFile.year}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={startStudySession} className="bg-primary hover:bg-primary-dark">
            <Play className="h-4 w-4 mr-2" />
            Study Now
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateDeckDialog(true)}
            className={currentStep === 'create-deck' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lecture Module
          </Button>
        </div>
      </div>

      {currentFile.decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No lecture modules yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first lecture module to organize study materials by topic or week.
          </p>
          <Button 
            onClick={() => setShowCreateDeckDialog(true)}
            className={currentStep === 'create-deck' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Lecture Module
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFile.decks.map((deck) => {
            const stats = getDeckStats(deck);
            return (
              <Card 
                key={deck.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleDeckSelect(deck)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{deck.name}</CardTitle>
                      {deck.courseName && (
                        <p className="text-sm text-muted-foreground">{deck.courseName}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {stats.dueCards > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.dueCards} due
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {deck.sections.length} lectures • {stats.totalCards} cards
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Click to manage lectures and upload materials
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Lecture Module Dialog */}
      <Dialog open={showCreateDeckDialog} onOpenChange={setShowCreateDeckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lecture Module</DialogTitle>
            <DialogDescription>
              Create a lecture module to organize study materials by topic or time period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deckName">Lecture Module Name</Label>
              <Input
                id="deckName"
                placeholder="e.g., Week 3: Integration Techniques"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="courseName">Topic/Description (Optional)</Label>
              <Input
                id="courseName"
                placeholder="e.g., Advanced Calculus Topics"
                value={newDeckCourse}
                onChange={(e) => setNewDeckCourse(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateDeckDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck}>
              Create Lecture Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}