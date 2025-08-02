import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, File, X, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDataStore } from '@/hooks/useDataStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LectureUploaderProps {
  sectionId: string;
  onClose: () => void;
}

interface ParsedFlashcard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function LectureUploader({ sectionId, onClose }: LectureUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCards, setGeneratedCards] = useState<ParsedFlashcard[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createFlashcard } = useDataStore();
  const { toast } = useToast();

  const acceptedTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const simulateAIGeneration = async (files: File[]): Promise<ParsedFlashcard[]> => {
    // Simulate AI processing with realistic progress
    const cards: ParsedFlashcard[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((i / files.length) * 80); // 80% for processing
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Generate mock flashcards based on file type
      const fileCards = generateMockCards(file.name, file.type);
      cards.push(...fileCards);
    }
    
    setProgress(100);
    return cards;
  };

  const generateMockCards = (fileName: string, fileType: string): ParsedFlashcard[] => {
    const mockCards: ParsedFlashcard[] = [
      {
        question: `What is the main topic covered in ${fileName}?`,
        answer: "This lecture covers fundamental concepts and their practical applications in the subject matter.",
        difficulty: 'medium'
      },
      {
        question: `Define the key term from ${fileName.replace(/\.[^/.]+$/, "")}`,
        answer: "A fundamental concept that forms the basis for understanding advanced topics in this field.",
        difficulty: 'easy'
      },
      {
        question: `Explain the methodology discussed in ${fileName}`,
        answer: "The systematic approach involves multiple steps that build upon each other to achieve the desired outcome.",
        difficulty: 'hard'
      }
    ];
    
    // Add more cards for PDF files (simulate more content)
    if (fileType.includes('pdf')) {
      mockCards.push(
        {
          question: "What are the practical applications mentioned?",
          answer: "Multiple real-world scenarios where these concepts can be applied effectively.",
          difficulty: 'medium'
        },
        {
          question: "What are the key formulas or equations?",
          answer: "Essential mathematical relationships that govern the behavior of the system.",
          difficulty: 'hard'
        }
      );
    }
    
    return mockCards;
  };

  const handleGenerateCards = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const cards = await simulateAIGeneration(selectedFiles);
      setGeneratedCards(cards);
      setShowPreview(true);
      
      toast({
        title: "Cards Generated!",
        description: `Successfully generated ${cards.length} flashcards from your lecture materials.`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleSaveCards = () => {
    generatedCards.forEach(card => {
      createFlashcard(sectionId, card.question, card.answer, card.difficulty);
    });
    
    toast({
      title: "Flashcards Saved!",
      description: `Added ${generatedCards.length} flashcards to your deck.`
    });
    
    onClose();
  };

  return (
    <>
      <Dialog open={!showPreview} onOpenChange={() => !isProcessing && onClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Lecture Materials</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Lecture Files</h3>
                <p className="text-muted-foreground mb-4">
                  Support for PDF, DOCX, images, and text files
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={Object.values(acceptedTypes).join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing files...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your content and generating flashcards...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateCards} 
                disabled={selectedFiles.length === 0 || isProcessing}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isProcessing ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Cards Preview */}
      <Dialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Generated Flashcards</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {generatedCards.length} flashcards generated from your lecture materials
              </p>
              <Badge variant="secondary">
                Ready to save
              </Badge>
            </div>

            <div className="grid gap-4">
              {generatedCards.map((card, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        card.difficulty === 'easy' ? 'secondary' : 
                        card.difficulty === 'medium' ? 'default' : 'destructive'
                      }>
                        {card.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Question:</h4>
                      <p className="text-sm">{card.question}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Answer:</h4>
                      <p className="text-sm text-muted-foreground">{card.answer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit Cards
              </Button>
              <Button onClick={handleSaveCards}>
                Save All Cards
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}