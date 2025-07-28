import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, BookOpen, FolderPlus, Edit, Trash2, Play, Calendar } from 'lucide-react';
import { StudyFile, Deck, Section, Flashcard } from '@/types/flashcard';
import { useDataStore } from '@/hooks/useDataStore';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { StudySessionView } from '@/components/StudySessionView';

interface FileDetailViewProps {
  file: StudyFile;
  onBack: () => void;
}

export function FileDetailView({ file, onBack }: FileDetailViewProps) {
  const [showCreateDeckDialog, setShowCreateDeckDialog] = useState(false);
  const [showCreateSectionDialog, setShowCreateSectionDialog] = useState(false);
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false);
  const [showStudyView, setShowStudyView] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckCourse, setNewDeckCourse] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionWeek, setNewSectionWeek] = useState('');
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const { createDeck, createSection, createFlashcard, getDueCards } = useDataStore();
  const { setCreatedIds, nextStep, currentStep } = useOnboarding();
  const { toast } = useToast();

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      toast({ title: "Error", description: "Please enter a deck name", variant: "destructive" });
      return;
    }

    const deck = createDeck(file.id, newDeckName.trim(), newDeckCourse.trim() || undefined);
    setCreatedIds(undefined, deck.id);
    
    if (currentStep === 'create-deck') {
      nextStep();
    }
    
    toast({ title: "Deck Created", description: `Deck "${newDeckName}" has been created!` });
    setShowCreateDeckDialog(false);
    setNewDeckName('');
    setNewDeckCourse('');
  };

  const handleCreateSection = () => {
    if (!newSectionName.trim() || !selectedDeck) {
      toast({ title: "Error", description: "Please enter a section name", variant: "destructive" });
      return;
    }

    const section = createSection(
      selectedDeck.id, 
      newSectionName.trim(), 
      newSectionWeek ? parseInt(newSectionWeek) : undefined
    );
    
    setCreatedIds(undefined, undefined, section.id);
    
    if (currentStep === 'create-section') {
      nextStep();
    }
    
    toast({ title: "Section Created", description: `Section "${newSectionName}" has been created!` });
    setShowCreateSectionDialog(false);
    setNewSectionName('');
    setNewSectionWeek('');
    setSelectedDeck(null);
  };

  const handleCreateFlashcard = () => {
    if (!newCardQuestion.trim() || !newCardAnswer.trim() || !selectedSection) {
      toast({ title: "Error", description: "Please fill in both question and answer", variant: "destructive" });
      return;
    }

    createFlashcard(selectedSection.id, newCardQuestion.trim(), newCardAnswer.trim(), newCardDifficulty);
    
    if (currentStep === 'create-manual-flashcard') {
      nextStep();
    }
    
    toast({ title: "Flashcard Created", description: "New flashcard has been created!" });
    setShowCreateCardDialog(false);
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardDifficulty('medium');
    setSelectedSection(null);
  };

  const getDeckStats = (deck: Deck) => {
    const totalCards = deck.sections.reduce((sum, section) => sum + section.flashcards.length, 0);
    const dueCards = getDueCards().filter(card => 
      deck.sections.some(section => section.flashcards.some(c => c.id === card.id))
    );
    return { totalCards, dueCards: dueCards.length };
  };

  const getSectionStats = (section: Section) => {
    const dueCards = getDueCards().filter(card => 
      section.flashcards.some(c => c.id === card.id)
    );
    return { totalCards: section.flashcards.length, dueCards: dueCards.length };
  };

  const startStudySession = () => {
    const dueCards = getDueCards().filter(card => 
      file.decks.some(deck => 
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

  if (showStudyView) {
    const studyCards = getDueCards().filter(card => 
      file.decks.some(deck => 
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
            <h1 className="text-3xl font-bold">{file.name}</h1>
            {file.semester && (
              <p className="text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {file.semester} {file.year}
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
            New Deck
          </Button>
        </div>
      </div>

      {file.decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first deck to organize flashcards by course or topic.
          </p>
          <Button 
            onClick={() => setShowCreateDeckDialog(true)}
            className={currentStep === 'create-deck' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Deck
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {file.decks.map((deck) => {
            const stats = getDeckStats(deck);
            return (
              <Card key={deck.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {deck.sections.length} sections • {stats.totalCards} cards
                      </span>
                    </div>
                    
                    {deck.sections.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">No sections yet</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedDeck(deck);
                            setShowCreateSectionDialog(true);
                          }}
                          className={currentStep === 'create-section' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''}
                        >
                          <FolderPlus className="h-3 w-3 mr-1" />
                          Add Section
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {deck.sections.slice(0, 3).map((section) => {
                          const sectionStats = getSectionStats(section);
                          return (
                            <div key={section.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">{section.name}</p>
                                {section.week && (
                                  <p className="text-xs text-muted-foreground">Week {section.week}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {sectionStats.dueCards > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {sectionStats.dueCards}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {sectionStats.totalCards} cards
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedSection(section);
                                    setShowCreateCardDialog(true);
                                  }}
                                  className={currentStep === 'create-manual-flashcard' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {deck.sections.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{deck.sections.length - 3} more sections
                          </p>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setSelectedDeck(deck);
                            setShowCreateSectionDialog(true);
                          }}
                        >
                          <FolderPlus className="h-3 w-3 mr-1" />
                          Add Section
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Deck Dialog */}
      <Dialog open={showCreateDeckDialog} onOpenChange={setShowCreateDeckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>
              Create a deck to organize flashcards by course or topic.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="deckName">Deck Name</Label>
              <Input
                id="deckName"
                placeholder="e.g., Data Structures"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="courseName">Course Name (Optional)</Label>
              <Input
                id="courseName"
                placeholder="e.g., CS 101"
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
              Create Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Section Dialog */}
      <Dialog open={showCreateSectionDialog} onOpenChange={setShowCreateSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a section to organize flashcards within {selectedDeck?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sectionName">Section Name</Label>
              <Input
                id="sectionName"
                placeholder="e.g., Chapter 1: Introduction"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="sectionWeek">Week (Optional)</Label>
              <Input
                id="sectionWeek"
                type="number"
                placeholder="e.g., 1"
                value={newSectionWeek}
                onChange={(e) => setNewSectionWeek(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection}>
              Create Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Flashcard Dialog */}
      <Dialog open={showCreateCardDialog} onOpenChange={setShowCreateCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Flashcard</DialogTitle>
            <DialogDescription>
              Add a flashcard to {selectedSection?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardQuestion">Question</Label>
              <Textarea
                id="cardQuestion"
                placeholder="Enter the question or prompt..."
                value={newCardQuestion}
                onChange={(e) => setNewCardQuestion(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="cardAnswer">Answer</Label>
              <Textarea
                id="cardAnswer"
                placeholder="Enter the answer or explanation..."
                value={newCardAnswer}
                onChange={(e) => setNewCardAnswer(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="cardDifficulty">Difficulty</Label>
              <Select value={newCardDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewCardDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateCardDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFlashcard}>
              Create Flashcard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}