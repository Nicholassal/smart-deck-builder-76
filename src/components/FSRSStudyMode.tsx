import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudySessionView } from './StudySessionView';
import { useDataStore } from '@/hooks/useDataStore';
import { Flashcard } from '@/types/flashcard';
import { fsrsScheduler } from '@/lib/fsrs';
import { Calendar, Clock, Brain, Target, TrendingUp } from 'lucide-react';

interface FSRSStudyModeProps {
  onBack: () => void;
}

export function FSRSStudyMode({ onBack }: FSRSStudyModeProps) {
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState<'due' | 'new' | 'all'>('due');
  
  const { files, getDueCards } = useDataStore();

  useEffect(() => {
    updateStudyCards();
  }, [studyMode, files]);

  const updateStudyCards = () => {
    const allCards: Flashcard[] = [];
    files.forEach(file => {
      file.decks.forEach(deck => {
        deck.sections.forEach(section => {
          allCards.push(...section.flashcards);
        });
      });
    });

    let cardsToStudy: Flashcard[] = [];
    
    switch (studyMode) {
      case 'due':
        cardsToStudy = getDueCards();
        break;
      case 'new':
        cardsToStudy = allCards.filter(card => card.fsrsData.state === 0);
        break;
      case 'all':
        cardsToStudy = allCards;
        break;
    }
    
    // Sort by priority (overdue cards first, then by difficulty)
    cardsToStudy.sort((a, b) => {
      const aOverdue = new Date(a.fsrsData.nextReview) < new Date();
      const bOverdue = new Date(b.fsrsData.nextReview) < new Date();
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // If both are overdue or both are not, sort by recall probability
      const aRecall = fsrsScheduler.getRecallProbability(a.fsrsData);
      const bRecall = fsrsScheduler.getRecallProbability(b.fsrsData);
      return aRecall - bRecall; // Lower recall probability first
    });

    setStudyCards(cardsToStudy);
  };

  const getStudyStats = () => {
    const allCards: Flashcard[] = [];
    files.forEach(file => {
      file.decks.forEach(deck => {
        deck.sections.forEach(section => {
          allCards.push(...section.flashcards);
        });
      });
    });

    const dueCards = getDueCards();
    const newCards = allCards.filter(card => card.fsrsData.state === 0);
    const reviewCards = allCards.filter(card => card.fsrsData.state === 2);
    const learningCards = allCards.filter(card => card.fsrsData.state === 1);

    return {
      total: allCards.length,
      due: dueCards.length,
      new: newCards.length,
      review: reviewCards.length,
      learning: learningCards.length,
    };
  };

  const stats = getStudyStats();

  if (isStudying && studyCards.length > 0) {
    return (
      <StudySessionView 
        cards={studyCards}
        onBack={() => {
          setIsStudying(false);
          updateStudyCards(); // Refresh cards after study session
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FSRS Study Mode</h1>
          <p className="text-muted-foreground">Scientifically optimized spaced repetition</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Files
        </Button>
      </div>

      {/* Study Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.due}</div>
            <div className="text-sm text-muted-foreground">Due for Review</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New Cards</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.review}</div>
            <div className="text-sm text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.learning}</div>
            <div className="text-sm text-muted-foreground">Learning</div>
          </CardContent>
        </Card>
      </div>

      {/* Study Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Select Study Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={studyMode === 'due' ? 'default' : 'outline'}
              onClick={() => setStudyMode('due')}
              className="h-16 flex flex-col"
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span>Due Cards ({stats.due})</span>
              <span className="text-xs opacity-75">Recommended</span>
            </Button>
            
            <Button
              variant={studyMode === 'new' ? 'default' : 'outline'}
              onClick={() => setStudyMode('new')}
              className="h-16 flex flex-col"
            >
              <Brain className="h-5 w-5 mb-1" />
              <span>New Cards ({stats.new})</span>
              <span className="text-xs opacity-75">Learn new material</span>
            </Button>
            
            <Button
              variant={studyMode === 'all' ? 'default' : 'outline'}
              onClick={() => setStudyMode('all')}
              className="h-16 flex flex-col"
            >
              <TrendingUp className="h-5 w-5 mb-1" />
              <span>All Cards ({stats.total})</span>
              <span className="text-xs opacity-75">Practice everything</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Study Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Ready to Study
            </div>
            <Badge variant="secondary">
              {studyCards.length} cards
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {studyCards.length > 0 ? (
            <>
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {studyMode === 'due' && 'Focus on cards that are due for review to maintain optimal retention.'}
                  {studyMode === 'new' && 'Learn new cards at a comfortable pace. The FSRS algorithm will schedule optimal review intervals.'}
                  {studyMode === 'all' && 'Practice all available cards. The algorithm will prioritize the most important ones.'}
                </p>
                
                <Button 
                  size="lg" 
                  onClick={() => setIsStudying(true)}
                  className="w-full md:w-auto"
                >
                  Start Study Session
                </Button>
              </div>

              {/* Study Preview */}
              {studyCards.slice(0, 3).map((card, index) => (
                <Card key={card.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          Next card #{index + 1}
                        </div>
                        <div className="font-medium line-clamp-2">
                          {card.question}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <Badge variant={
                          card.fsrsData.state === 0 ? 'default' :
                          card.fsrsData.state === 1 ? 'secondary' :
                          card.fsrsData.state === 2 ? 'outline' : 'destructive'
                        }>
                          {card.fsrsData.state === 0 ? 'New' :
                           card.fsrsData.state === 1 ? 'Learning' :
                           card.fsrsData.state === 2 ? 'Review' : 'Relearning'}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {card.fsrsData.reps} reviews
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {studyMode === 'due' && 'No cards are due for review right now. Great job staying on top of your studies!'}
                {studyMode === 'new' && 'No new cards available. Create more flashcards to continue learning.'}
                {studyMode === 'all' && 'No cards available. Create some flashcards to get started.'}
              </div>
              <Button variant="outline" onClick={onBack}>
                Go to Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FSRS Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About FSRS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            FSRS (Free Spaced Repetition Scheduler) is a modern, scientifically-backed algorithm 
            that optimizes review intervals based on your memory retention patterns. It automatically 
            adjusts the difficulty and scheduling of each card based on your performance, ensuring 
            maximum efficiency in your learning process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}