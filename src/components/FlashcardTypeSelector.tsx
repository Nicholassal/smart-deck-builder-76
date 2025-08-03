import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Image, Calculator, FileText, X, ChevronDown } from 'lucide-react';
import { FlashcardCreator } from './FlashcardCreator';
import { ImageFlashcardCreator } from './ImageFlashcardCreator';

interface FlashcardTypeSelectorProps {
  deckId: string;
  onClose: () => void;
}

type FlashcardType = 'basic' | 'image' | 'equation' | 'diagram';

interface FlashcardTypeOption {
  id: FlashcardType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const flashcardTypes: FlashcardTypeOption[] = [
  {
    id: 'basic',
    name: 'Basic Flashcard',
    description: 'Simple question and answer format',
    icon: BookOpen,
    available: true
  },
  {
    id: 'image',
    name: 'Image Flashcard',
    description: 'Flashcards with images and masking features',
    icon: Image,
    available: true
  },
  {
    id: 'equation',
    name: 'Math Equation',
    description: 'Mathematical formulas and equations',
    icon: Calculator,
    available: false
  },
  {
    id: 'diagram',
    name: 'Diagram',
    description: 'Labeled diagrams and charts',
    icon: FileText,
    available: false
  }
];

export function FlashcardTypeSelector({ deckId, onClose }: FlashcardTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<FlashcardType>('basic');
  const [showCreator, setShowCreator] = useState(false);

  const selectedTypeOption = flashcardTypes.find(type => type.id === selectedType);

  // If ready to create, show the appropriate creator
  if (showCreator && selectedType === 'basic') {
    return <FlashcardCreator deckId={deckId} onClose={onClose} />;
  }

  if (showCreator && selectedType === 'image') {
    return <ImageFlashcardCreator deckId={deckId} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Create Flashcards</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Choose the type of flashcard you want to create
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Flashcard Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Flashcard Type</label>
            <Select value={selectedType} onValueChange={(value: FlashcardType) => setSelectedType(value)}>
              <SelectTrigger className="w-full h-12">
                <div className="flex items-center gap-3">
                  {selectedTypeOption && (
                    <>
                      <selectedTypeOption.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{selectedTypeOption.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedTypeOption.description}</div>
                      </div>
                    </>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {flashcardTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem 
                      key={type.id} 
                      value={type.id}
                      disabled={!type.available}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{type.name}</span>
                            {!type.available && (
                              <Badge variant="secondary" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Type Preview */}
          {selectedTypeOption && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <selectedTypeOption.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedTypeOption.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTypeOption.description}
                  </p>
                  {!selectedTypeOption.available && (
                    <p className="text-sm text-orange-600 mt-2">
                      This flashcard type is coming soon! For now, you can use basic or image flashcards.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={() => setShowCreator(true)}
              disabled={!selectedTypeOption?.available}
              size="lg"
            >
              Create {selectedTypeOption?.name || 'Flashcard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}