import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calculator, CheckCircle2, XCircle, RotateCcw, Eye } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface EquationFlashcardViewProps {
  flashcard: Flashcard;
  onResponse: (response: 'again' | 'hard' | 'good' | 'easy', timeCompleted: boolean) => void;
  onNext: () => void;
}

export function EquationFlashcardView({ flashcard, onResponse, onNext }: EquationFlashcardViewProps) {
  const [phase, setPhase] = useState<'question' | 'solving' | 'checking' | 'result'>('question');
  const [timeLeft, setTimeLeft] = useState(flashcard.timeLimit || 300);
  const [totalTime] = useState(flashcard.timeLimit || 300);
  const [timerActive, setTimerActive] = useState(false);
  const [timeCompleted, setTimeCompleted] = useState(false);
  const [userCorrect, setUserCorrect] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setTimeCompleted(false);
            setPhase('result');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  const startSolving = () => {
    setPhase('solving');
    setTimerActive(true);
  };

  const finishSolving = () => {
    setTimerActive(false);
    setTimeCompleted(timeLeft > 0);
    setPhase('checking');
  };

  const handleCorrectness = (isCorrect: boolean) => {
    setUserCorrect(isCorrect);
    setPhase('result');
  };

  const handleResponse = (response: 'again' | 'hard' | 'good' | 'easy') => {
    const wasOnTime = timeCompleted && userCorrect === true;
    onResponse(response, wasOnTime);
  };

  const restart = () => {
    setPhase('question');
    setTimeLeft(totalTime);
    setTimerActive(false);
    setTimeCompleted(false);
    setUserCorrect(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getTimerColor = () => {
    const remaining = timeLeft / totalTime;
    if (remaining > 0.5) return 'text-green-600';
    if (remaining > 0.25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>Equation Challenge</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(totalTime)}
            </Badge>
          </div>
          
          {phase === 'solving' && (
            <div className="flex items-center gap-3">
              <div className={cn("text-2xl font-mono font-bold", getTimerColor())}>
                {formatTime(timeLeft)}
              </div>
              <Button variant="outline" size="sm" onClick={finishSolving}>
                I'm Done
              </Button>
            </div>
          )}
        </div>

        {phase === 'solving' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Time Remaining</span>
              <span>{Math.round((timeLeft / totalTime) * 100)}%</span>
            </div>
            <Progress value={getTimeProgress()} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Phase */}
        {phase === 'question' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <h2 className="text-xl font-semibold mb-3">
                  {flashcard.question || 'Solve the equation'}
                </h2>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Get your draft paper ready</p>
                  <p>• You have {formatTime(totalTime)} to complete this problem</p>
                  <p>• Timer starts when you click "Start Solving"</p>
                </div>
              </div>
              
              <Button onClick={startSolving} size="lg" className="px-8">
                Start Solving
              </Button>
            </div>
          </div>
        )}

        {/* Solving Phase */}
        {phase === 'solving' && (
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-3">
                {flashcard.question || 'Solve the equation'}
              </h2>
              <div className="text-lg text-muted-foreground mb-4">
                Work through the problem on your draft paper
              </div>
              
              {timeLeft <= 10 && timeLeft > 0 && (
                <div className="text-red-600 font-bold text-xl animate-pulse">
                  {timeLeft} seconds left!
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Click "I'm Done" when you've finished solving or need to see the answer
              </p>
            </div>
          </div>
        )}

        {/* Checking Phase */}
        {phase === 'checking' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Question</h3>
                <p>{flashcard.question || 'Solve the equation'}</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold mb-2 text-green-800 dark:text-green-200">
                  Correct Answer
                </h3>
                <div className="whitespace-pre-wrap text-green-700 dark:text-green-300">
                  {flashcard.answer}
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Compare your solution with the correct answer
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Did you get it right?
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => handleCorrectness(true)} 
                  variant="outline"
                  className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  I got it right
                </Button>
                <Button 
                  onClick={() => handleCorrectness(false)} 
                  variant="outline"
                  className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  I got it wrong
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              {timeLeft === 0 ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Time's Up!</h3>
                  <p className="text-red-600 dark:text-red-300">
                    You didn't complete the problem in time. This counts as incorrect.
                  </p>
                </div>
              ) : timeCompleted && userCorrect ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Excellent!</h3>
                  <p className="text-green-600 dark:text-green-300">
                    You solved it correctly and within the time limit!
                  </p>
                </div>
              ) : userCorrect === false ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Not Quite</h3>
                  <p className="text-red-600 dark:text-red-300">
                    {timeCompleted ? 'You finished in time, but the answer was incorrect.' : 'The answer was incorrect.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <CheckCircle2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Good Work!</h3>
                  <p className="text-yellow-600 dark:text-yellow-300">
                    You got it right, but took longer than the time limit.
                  </p>
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Solution</h3>
                <div className="whitespace-pre-wrap text-sm">
                  {flashcard.answer}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={() => handleResponse('again')} variant="outline" className="text-red-600">
                Again
              </Button>
              <Button onClick={() => handleResponse('hard')} variant="outline" className="text-orange-600">
                Hard
              </Button>
              <Button onClick={() => handleResponse('good')} variant="outline" className="text-green-600">
                Good
              </Button>
              <Button onClick={() => handleResponse('easy')} variant="outline" className="text-blue-600">
                Easy
              </Button>
              <Button onClick={restart} variant="ghost" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}