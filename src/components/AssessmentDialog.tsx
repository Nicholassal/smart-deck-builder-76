import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studySchedulerService } from '@/services/StudySchedulerService';
import { CreateAssessmentForm, StudyDeck, StudyFile } from '@/types/study';
import { useStudyScheduler } from '@/hooks/useStudyScheduler';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [timeUnit, setTimeUnit] = useState<'hours' | 'minutes'>('hours');
  const [equalWeighting, setEqualWeighting] = useState<boolean>(true);
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

  // Prefill from stored preferences
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem('studyPreferences');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.daily_minutes === 'number') setDailyMinutes(parsed.daily_minutes);
        if (typeof parsed.equal_weighting === 'boolean') setEqualWeighting(parsed.equal_weighting);
      }
    } catch {}
  }, [open]);

  const handleToggleDeck = (deckId: string) => {
    setSelectedDeckWeights(prev => {
      const next = { ...prev };
      if (next[deckId] === undefined) {
        next[deckId] = 1;
      } else {
        delete next[deckId];
      }
      // If equal weighting, redistribute to sum 100
      if (equalWeighting) {
        const ids = Object.keys(next);
        if (ids.length > 0) {
          const base = Math.floor(100 / ids.length);
          const remainder = 100 - base * ids.length;
          const redistributed: Record<string, number> = {};
          ids.forEach((id, idx) => (redistributed[id] = base + (idx < remainder ? 1 : 0)));
          return redistributed;
        }
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
                <div className="flex items-center gap-3">
                  <div className="text-xs text-muted-foreground">
                    {!equalWeighting && (
                      <>Weights total: {Object.keys(selectedDeckWeights).reduce((s, id) => s + (selectedDeckWeights[id] || 0), 0)}/100</>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Equal weighting</span>
                    <Switch checked={equalWeighting} onCheckedChange={(v) => {
                      setEqualWeighting(!!v);
                      if (v) {
                        const ids = Object.keys(selectedDeckWeights);
                        if (ids.length > 0) {
                          const base = Math.floor(100 / ids.length);
                          const remainder = 100 - base * ids.length;
                          const redistributed: Record<string, number> = {};
                          ids.forEach((id, idx) => (redistributed[id] = base + (idx < remainder ? 1 : 0)));
                          setSelectedDeckWeights(redistributed);
                        }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>Course color: <span className="inline-block w-3 h-3 rounded-sm align-middle" style={{ backgroundColor: selectedFile.color_hex }} /></div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const all: Record<string, number> = {};
                    decks.forEach(d => (all[d.deck_id] = 1));
                    if (equalWeighting && decks.length > 0) {
                      const base = Math.floor(100 / decks.length);
                      const remainder = 100 - base * decks.length;
                      decks.forEach((d, idx) => (all[d.deck_id] = base + (idx < remainder ? 1 : 0)));
                    }
                    setSelectedDeckWeights(all);
                  }}>Select all</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDeckWeights({})}>Clear</Button>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-auto pr-1">
                {decks.map(deck => {
                  const included = selectedDeckWeights[deck.deck_id] !== undefined;
                  return (
                    <div key={deck.deck_id} className="flex items-center justify-between gap-3 p-2 border rounded-md">
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox checked={included} onCheckedChange={() => handleToggleDeck(deck.deck_id)} />
                        <div className="text-left">
                          <div className="font-medium">{deck.name}</div>
                          <div className="text-xs text-muted-foreground">Est. {deck.est_minutes} min</div>
                        </div>
                      </div>
                      {included && (
                        equalWeighting ? (
                          <div className="text-xs text-muted-foreground w-24 text-right">{selectedDeckWeights[deck.deck_id]}%</div>
                        ) : (
                          <div className="w-28">
                            <Label className="text-xs">Weight (%)</Label>
                            <Input type="number" min={0} max={100} value={selectedDeckWeights[deck.deck_id]} onChange={e => handleWeightChange(deck.deck_id, Number(e.target.value))} />
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Daily Study Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={timeUnit} onValueChange={(v) => setTimeUnit(v as 'hours' | 'minutes')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Units" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={timeUnit === 'hours' ? 0.25 : 15}
                step={timeUnit === 'hours' ? 0.25 : 5}
                value={timeUnit === 'hours' ? Number((dailyMinutes / 60).toFixed(2)) : dailyMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDailyMinutes(timeUnit === 'hours' ? Math.round(val * 60) : Math.round(val));
                }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={onSubmit} disabled={
              isSubmitting || !name || !date || !fileId ||
              Object.keys(selectedDeckWeights).length === 0 ||
              (!equalWeighting && Object.keys(selectedDeckWeights).reduce((s, id) => s + (selectedDeckWeights[id] || 0), 0) !== 100)
            }>
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
