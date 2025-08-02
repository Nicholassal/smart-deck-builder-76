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

interface DeckViewProps {
  deck: Deck;
  onBack: () => void;
}

export function DeckView({ deck, onBack }: DeckViewProps) {
  const [showLectureUploader, setShowLectureUploader] = useState(false);
  const [showCreateSectionDialog, setShowCreateSectionDialog] = useState(false);
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionWeek, setNewSectionWeek] = useState('');
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const { createSection, createFlashcard, getDueCards } = useDataStore();
  const { toast } = useToast();

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast({ title: "Error", description: "Please enter a section name", variant: "destructive" });
      return;
    }

    createSection(
      deck.id, 
      newSectionName.trim(), 
      newSectionWeek ? parseInt(newSectionWeek) : undefined
    );
    
    toast({ title: "Section Created", description: `Section "${newSectionName}" has been created!` });
    setShowCreateSectionDialog(false);
    setNewSectionName('');
    setNewSectionWeek('');
  };

  const handleCreateFlashcard = () => {
    if (!newCardQuestion.trim() || !newCardAnswer.trim() || !selectedSection) {
      toast({ title: "Error", description: "Please fill in both question and answer", variant: "destructive" });
      return;
    }

    createFlashcard(selectedSection.id, newCardQuestion.trim(), newCardAnswer.trim(), newCardDifficulty);
    
    toast({ title: "Flashcard Created", description: "New flashcard has been created!" });
    setShowCreateCardDialog(false);
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardDifficulty('medium');
    setSelectedSection(null);
  };

  const getSectionStats = (section: Section) => {
    const dueCards = getDueCards().filter(card => 
      section.flashcards.some(c => c.id === card.id)
    );
    return { totalCards: section.flashcards.length, dueCards: dueCards.length };
  };

  const handleUploadToSection = (section: Section) => {
    setSelectedSection(section);
    setShowLectureUploader(true);
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
        
        <Button 
          onClick={() => setShowCreateSectionDialog(true)}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {deck.sections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No lectures yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by creating your first lecture section. Each section represents one class or topic.
          </p>
          <div className="space-y-2">
            <Button onClick={() => setShowCreateSectionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Lecture
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deck.sections.map((section) => {
            const stats = getSectionStats(section);
            return (
              <Card key={section.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{section.name}</CardTitle>
                      {section.week && (
                        <p className="text-sm text-muted-foreground">Week {section.week}</p>
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
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {stats.totalCards} flashcards
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleUploadToSection(section)}
                    >
                      <Upload className="h-3 w-3 mr-2" />
                      Upload Lecture Notes
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedSection(section);
                        setShowCreateCardDialog(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Create Custom Flashcard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lecture Uploader */}
      {showLectureUploader && selectedSection && (
        <LectureUploader 
          sectionId={selectedSection.id}
          onClose={() => {
            setShowLectureUploader(false);
            setSelectedSection(null);
          }}
        />
      )}

      {/* Create Section Dialog */}
      <Dialog open={showCreateSectionDialog} onOpenChange={setShowCreateSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
            <DialogDescription>
              Add a new lecture section to organize your study materials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sectionName">Lecture Title</Label>
              <Input
                id="sectionName"
                placeholder="e.g., Week 3: Integration Techniques"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="sectionWeek">Week Number (Optional)</Label>
              <Input
                id="sectionWeek"
                type="number"
                placeholder="e.g., 3"
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
              Create Lecture
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Flashcard Dialog */}
      <Dialog open={showCreateCardDialog} onOpenChange={setShowCreateCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Flashcard</DialogTitle>
            <DialogDescription>
              Add a custom flashcard to {selectedSection?.name}.
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