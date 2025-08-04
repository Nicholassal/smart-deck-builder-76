import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Calculator, X } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { toast } from 'sonner';

interface EquationFlashcardCreatorProps {
  sectionId: string;
  onClose: () => void;
  onCardCreated: () => void;
}

export function EquationFlashcardCreator({ sectionId, onClose, onCardCreated }: EquationFlashcardCreatorProps) {
  const { createFlashcard } = useDataStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [timeLimit, setTimeLimit] = useState<number>(300); // 5 minutes default
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!answer.trim()) {
      toast.error('Answer is required for equation cards');
      return;
    }

    if (timeLimit < 30 || timeLimit > 3600) {
      toast.error('Time limit must be between 30 seconds and 1 hour');
      return;
    }

    setIsLoading(true);
    try {
      await createFlashcard(
        sectionId,
        question.trim() || 'Solve the equation',
        answer.trim(),
        difficulty,
        undefined,
        undefined,
        'equation',
        timeLimit
      );
      
      toast.success('Equation flashcard created successfully!');
      setQuestion('');
      setAnswer('');
      setTimeLimit(300);
      setDifficulty('medium');
      onCardCreated();
    } catch (error) {
      toast.error('Failed to create flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Create Equation Flashcard</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Timed Challenge</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Students must solve within the time limit. Auto-fail if time runs out.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="question">Question (Optional)</Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Find the derivative of f(x) = 3x² + 2x - 5"
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to use default prompt: "Solve the equation"
          </p>
        </div>

        <div>
          <Label htmlFor="answer">Answer/Solution *</Label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., f'(x) = 6x + 2"
            className="min-h-[120px]"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Provide the complete solution or final answer
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Time Limit</Label>
            <div className="flex items-center gap-2 mt-1">
              <Select value={timeLimit.toString()} onValueChange={(value) => setTimeLimit(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="900">15 minutes</SelectItem>
                  <SelectItem value="1200">20 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeLimit)}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
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
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Study Tips</h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Encourage students to work on draft paper</li>
            <li>• Practice time management for exams</li>
            <li>• Focus on both accuracy and speed</li>
            <li>• Review solutions for learning</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleCreate} 
            disabled={!answer.trim() || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Creating...' : 'Create Equation Card'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}