import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Calendar, BookOpen } from 'lucide-react';
import { StudyFile } from '@/types/flashcard';
import { Badge } from '@/components/ui/badge';
import { FileMenu } from './FileMenu';

interface FileCardProps {
  file: StudyFile;
  onClick: () => void;
  onUpdate?: () => void;
}

export function FileCard({ file, onClick, onUpdate }: FileCardProps) {
  const totalDecks = file.decks.length;
  const totalCards = file.decks.reduce((sum, deck) => 
    sum + deck.sections.reduce((sectionSum, section) => 
      sectionSum + section.flashcards.length, 0), 0);

  const cardStyle = file.color ? 
    { background: `linear-gradient(135deg, ${file.color}, ${file.color})` } : 
    {};

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 bg-card border-border hover:scale-[1.02]" 
      onClick={onClick}
      style={cardStyle}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className={`h-5 w-5 ${file.color ? 'text-white' : 'text-primary'}`} />
            <CardTitle className={`text-lg font-semibold ${file.color ? 'text-white' : ''}`}>
              {file.name}
            </CardTitle>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <FileMenu file={file} onRename={onUpdate} />
          </div>
        </div>
        
        {file.semester && (
          <div className={`flex items-center space-x-2 text-sm ${file.color ? 'text-white/80' : 'text-muted-foreground'}`}>
            <Calendar className="h-4 w-4" />
            <span>{file.semester} {file.year}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className={`h-4 w-4 ${file.color ? 'text-white/80' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${file.color ? 'text-white/80' : 'text-muted-foreground'}`}>
                {totalDecks} {totalDecks === 1 ? 'course' : 'courses'}
              </span>
            </div>
            <Badge 
              variant={file.color ? "outline" : "secondary"} 
              className={`text-xs ${file.color ? 'border-white/30 text-white' : ''}`}
            >
              {totalCards} cards
            </Badge>
          </div>
          
          <div className={`text-xs ${file.color ? 'text-white/60' : 'text-muted-foreground'}`}>
            {new Date(file.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}