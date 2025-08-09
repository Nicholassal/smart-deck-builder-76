import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studySchedulerService } from '@/services/StudySchedulerService';
import { CreateAssessmentForm, StudyDeck, StudyFile } from '@/types/study';
import { useStudyScheduler } from '@/hooks/useStudyScheduler';
import { format } from 'date-fns';

interface AssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssessmentDialog({ open, onOpenChange }: AssessmentDialogProps) {
  const { files, createAssessment } = useStudyScheduler();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [fileId, setFileId] = useState<string>('');
  const [decks, setDecks] = useState<StudyDeck[]>([]);
  const [selectedDeckWeights, setSelectedDeckWeights] = useState<Record<string, number>>({});
  const [dailyMinutes, setDailyMinutes] = useState<number>(90);
  const [weight, setWeight] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedFile: StudyFile | undefined = useMemo(
    () => files.find(f => f.file_id === fileId),
    [files, fileId]
  );

  useEffect(() => {
    async function loadDecks() {
      if (!fileId) return;
      const result = await studySchedulerService.getDecks(fileId);
      setDecks(result);
      // initialize weights to 1
      const defaults: Record<string, number> = {};
      result.forEach(d => (defaults[d.deck_id] = 1));
      setSelectedDeckWeights(defaults);
    }
    loadDecks();
  }, [fileId]);

  const handleToggleDeck = (deckId: string) => {
    setSelectedDeckWeights(prev => {
      const next = { ...prev };
      if (next[deckId] === undefined) {
        next[deckId] = 1;
      } else {
        delete next[deckId];
      }
      return next;
    });
  };

  const handleWeightChange = (deckId: string, value: number) => {
    setSelectedDeckWeights(prev => ({ ...prev, [deckId]: value }));
  };

  const onSubmit = async () => {
    if (!name || !date || !fileId) return;
    setIsSubmitting(true);
    try {
      const form: CreateAssessmentForm = {
        name,
        date: new Date(date),
        file_ids: [fileId],
        weight,
        deck_weights: Object.entries(selectedDeckWeights).map(([deck_id, w]) => ({ deck_id, weight: Number(w) })),
        daily_minutes: Number(dailyMinutes)
      };
      await createAssessment(form);
      onOpenChange(false);
      // reset
      setName('');
      setDate('');
      setFileId('');
      setDecks([]);
      setSelectedDeckWeights({});
      setDailyMinutes(90);
      setWeight(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Assessment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="assess-name">Name</Label>
            <Input id="assess-name" placeholder="e.g., Calculus Final" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="assess-date">Date</Label>
              <Input id="assess-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Overall Weight</Label>
              <Input type="number" min={1} value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label>Course/File</Label>
            <Select value={fileId} onValueChange={setFileId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {files.map(f => (
                  <SelectItem key={f.file_id} value={f.file_id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subtopics (Decks) and Weights</Label>
                <div className="text-sm text-muted-foreground">Color: <span className="inline-block w-3 h-3 rounded-sm align-middle" style={{ backgroundColor: selectedFile.color_hex }} /></div>
              </div>

              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {decks.map(deck => {
                  const included = selectedDeckWeights[deck.deck_id] !== undefined;
                  return (
                    <div key={deck.deck_id} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                      <button type="button" onClick={() => handleToggleDeck(deck.deck_id)} className="text-left flex-1">
                        <div className="font-medium">{deck.name}</div>
                        <div className="text-xs text-muted-foreground">Est. {deck.est_minutes} min</div>
                      </button>
                      {included && (
                        <div className="w-24">
                          <Label className="text-xs">Weight</Label>
                          <Input type="number" min={1} value={selectedDeckWeights[deck.deck_id]} onChange={e => handleWeightChange(deck.deck_id, Number(e.target.value))} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Daily Study Minutes</Label>
            <Input type="number" min={15} value={dailyMinutes} onChange={e => setDailyMinutes(Number(e.target.value))} />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={onSubmit} disabled={isSubmitting || !name || !date || !fileId}>
              Create & Generate Plan
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
