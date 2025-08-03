import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { PdfProcessingService, ProcessingOptions } from '@/services/PdfProcessingService';
import { useToast } from '@/components/ui/use-toast';

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlashcardsGenerated: (flashcards: any[]) => void;
  deckId?: string;
}

export function PdfUploadDialog({ 
  open, 
  onOpenChange, 
  onFlashcardsGenerated,
  deckId 
}: PdfUploadDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<ProcessingOptions>({
    maxCards: 20,
    difficulty: 'mixed',
    language: 'en'
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = PdfProcessingService.validatePdfFile(selectedFile);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await PdfProcessingService.processePdfFile(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.flashcards) {
        toast({
          title: 'Success!',
          description: `Generated ${result.flashcards.length} flashcards from your PDF`,
        });

        // Pass flashcards to parent component
        onFlashcardsGenerated(result.flashcards);
        onOpenChange(false);
      } else {
        toast({
          title: 'Processing Failed',
          description: result.error || 'Failed to process PDF',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process PDF file',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setFile(null);
      setProgress(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload PDF for Flashcards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Feature Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI-powered flashcard generation is currently in development. 
              This feature will automatically create study cards from your PDF content.
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Select PDF File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center gap-2 justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={processing}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to select or drag and drop
                  </p>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                    disabled={processing}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Processing Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-cards">Max Cards</Label>
                <Input
                  id="max-cards"
                  type="number"
                  min="5"
                  max="100"
                  value={options.maxCards}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    maxCards: parseInt(e.target.value) || 20 
                  }))}
                  disabled={processing}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={options.difficulty}
                  onValueChange={(value: any) => setOptions(prev => ({ 
                    ...prev, 
                    difficulty: value 
                  }))}
                  disabled={processing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing PDF...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || processing}
              className="bg-primary hover:bg-primary-dark"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}