import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const [dailyMinutes, setDailyMinutes] = useState<number>(90);
  const [equalWeighting, setEqualWeighting] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      const raw = localStorage.getItem('studyPreferences');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed.daily_minutes === 'number') setDailyMinutes(parsed.daily_minutes);
          if (typeof parsed.equal_weighting === 'boolean') setEqualWeighting(parsed.equal_weighting);
        } catch {}
      }
    }
  }, [open]);

  const handleSave = () => {
    const prefs = { daily_minutes: dailyMinutes, equal_weighting: equalWeighting };
    localStorage.setItem('studyPreferences', JSON.stringify(prefs));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Study Preferences</DialogTitle>
          <DialogDescription>Adjust your daily study time and weighting strategy. These settings guide plan generation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="minutes">Daily study minutes</Label>
            <Input
              id="minutes"
              type="number"
              min={15}
              step={5}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">Equal weighting</div>
              <div className="text-sm text-muted-foreground">Distribute time equally across selected subtopics</div>
            </div>
            <Switch checked={equalWeighting} onCheckedChange={(v) => setEqualWeighting(!!v)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
