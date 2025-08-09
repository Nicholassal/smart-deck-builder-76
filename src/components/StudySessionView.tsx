import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Brain, Clock } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { useDataStore } from '@/hooks/useDataStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fsrsScheduler } from '@/lib/fsrs';

interface StudySessionViewProps {
  cards: Flashcard[];
  onBack: () => void;
}

export function StudySessionView({ cards, onBack }: StudySessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  
  const { studyFlashcard } = useDataStore();
  const { toast } = useToast();

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const remainingCards = cards.length - completedCards.length;

  useEffect(() => {
    setCardStartTime(new Date());
  }, [currentIndex]);

  const handleResponse = (response: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    const responseTime = Date.now() - cardStartTime.getTime();
    const isCorrect = response === 'good' || response === 'easy';

    studyFlashcard(currentCard.id, response, responseTime, isCorrect);
    setCompletedCards(prev => [...prev, currentCard.id]);

    // Move to next card or finish session
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const sessionDuration = Date.now() - sessionStartTime.getTime();
    const minutes = Math.round(sessionDuration / 60000);
    
    toast({
      title: "Session Complete!",
      description: `Great job! You studied ${cards.length} cards in ${minutes} minutes.`,
    });
    
    onBack();
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const skipCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      finishSession();
    }
  };

  const getResponseButtonData = () => {
    if (!currentCard) return [];

    const responses: ('again' | 'hard' | 'good' | 'easy')[] = ['again', 'hard', 'good', 'easy'];
    
    return responses.map(response => {
      // Calculate what the next interval would be for each response
      const previewCard = fsrsScheduler.review(currentCard.fsrsData, response);
      const interval = formatInterval(previewCard.scheduledDays);
      
      const buttonData = {
        again: {
          label: 'Again',
          variant: 'destructive',
          icon: <XCircle className="h-5 w-5 mb-1" />,
        },
        hard: {
          label: 'Hard',
          variant: 'outline',
          icon: <div className="h-5 w-5 mb-1 rounded-full bg-orange-400" />,
        },
        good: {
          label: 'Good',
          variant: 'outline',
          icon: <CheckCircle className="h-5 w-5 mb-1" />,
        },
        easy: {
          label: 'Easy',
          variant: 'outline',
          icon: <div className="h-5 w-5 mb-1 rounded-full bg-blue-400" />,
        },
      };

      return {
        response,
        interval,
        ...buttonData[response],
      };
    });
  };

  const formatInterval = (days: number): string => {
    if (days < 1) return '<1m';
    if (days === 1) return '1d';
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${Math.round(days / 365)}y`;
  };

  if (!currentCard) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No cards to study</h3>
        <p className="text-muted-foreground mb-4">
          All cards are up to date! Check back later for more reviews.
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentIndex + 1}</div>
              <div className="text-sm text-muted-foreground">of {cards.length}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{remainingCards}</div>
              <div className="text-sm text-muted-foreground">remaining</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {Math.round(progress)}%</span>
            <span>{completedCards.length} completed</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center">
          <Card 
            className={cn(
              "w-full max-w-2xl min-h-[400px] cursor-pointer transition-all duration-300",
              "bg-card border-border hover:shadow-lg"
            )}
            onClick={handleFlip}
          >
            <CardContent className="p-8 h-full flex flex-col justify-center">
              {/* Card Info */}
              <div className="flex justify-between items-center mb-6">
                <Badge 
                  variant={
                    currentCard.difficulty === 'easy' ? 'default' : 
                    currentCard.difficulty === 'medium' ? 'secondary' : 
                    'destructive'
                  }
                >
                  {currentCard.difficulty}
                </Badge>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-1" />
                    {currentCard.fsrsData.reps} reviews
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentCard.fsrsData.state === 0 ? 'New' : 
                     currentCard.fsrsData.state === 1 ? 'Learning' :
                     currentCard.fsrsData.state === 2 ? 'Review' : 'Relearning'}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div>
                  <h3 className="text-sm text-muted-foreground mb-3">
                    {isFlipped ? 'Answer' : 'Question'}
                  </h3>
                  <div className="text-xl leading-relaxed min-h-[120px] flex items-center">
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </div>
                </div>

                {currentCard.imageUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={currentCard.imageUrl} 
                      alt="Flashcard visual"
                      className="max-w-full max-h-48 object-contain rounded-lg"
                    />
                  </div>
                )}

                {!isFlipped && (
                  <div className="text-center">
                    <Button variant="outline" size="lg" onClick={handleFlip}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Show Answer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Buttons */}
        {isFlipped && (
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
              {getResponseButtonData().map(({ response, label, variant, icon, interval }) => (
                <Button
                  key={response}
                  variant={variant as any}
                  onClick={() => handleResponse(response)}
                  className={cn(
                    "flex flex-col h-16 p-2",
                    variant === 'outline' && response === 'hard' && "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20",
                    variant === 'outline' && response === 'good' && "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20",
                    variant === 'outline' && response === 'easy' && "border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  )}
                >
                  {icon}
                  <span className="text-xs">{label}</span>
                  <span className="text-xs opacity-75">{interval}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Skip Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={skipCard} className="text-muted-foreground">
            Skip Card
          </Button>
        </div>
      </div>
    </div>
  );
}