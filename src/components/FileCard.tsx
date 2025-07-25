import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Calendar, BookOpen, MoreVertical } from 'lucide-react';
import { StudyFile } from '@/types/flashcard';
import { Badge } from '@/components/ui/badge';

interface FileCardProps {
  file: StudyFile;
  onClick: () => void;
}

export function FileCard({ file, onClick }: FileCardProps) {
  const totalDecks = file.decks.length;
  const totalCards = file.decks.reduce((sum, deck) => 
    sum + deck.sections.reduce((sectionSum, section) => 
      sectionSum + section.flashcards.length, 0), 0);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{file.name}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add file menu options
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {file.semester && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{file.semester} {file.year}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {totalDecks} {totalDecks === 1 ? 'course' : 'courses'}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {totalCards} cards
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {new Date(file.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}