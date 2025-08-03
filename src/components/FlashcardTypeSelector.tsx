import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Image, Calculator, FileText, X } from 'lucide-react';
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
  const [selectedType, setSelectedType] = useState<FlashcardType | null>(null);

  if (selectedType === 'basic') {
    return <FlashcardCreator deckId={deckId} onClose={onClose} />;
  }

  if (selectedType === 'image') {
    return <ImageFlashcardCreator deckId={deckId} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Choose Flashcard Type</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Select the type of flashcard you want to create
          </p>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flashcardTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                  type.available 
                    ? 'hover:border-primary' 
                    : 'opacity-50 cursor-not-allowed border-muted'
                }`}
                onClick={() => type.available && setSelectedType(type.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-semibold">{type.name}</h3>
                      {!type.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  
                  {type.available && (
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedType(type.id);
                      }}
                    >
                      Create {type.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}