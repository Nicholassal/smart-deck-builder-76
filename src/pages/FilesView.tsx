import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Plus } from 'lucide-react';
import { FileCard } from '@/components/FileCard';
import { StudyFile } from '@/types/flashcard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useDataStore } from '@/hooks/useDataStore';

interface FilesViewProps {
  onFileSelect: (file: StudyFile) => void;
  onCreateFile: () => void;
}

export function FilesView({ onFileSelect, onCreateFile }: FilesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { files } = useDataStore();
  const { currentStep, isOnboardingActive } = useOnboarding();

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.decks.some(deck => 
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Files</h1>
          <p className="text-muted-foreground">Organize your courses by semester</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary-light">
            <Upload className="h-4 w-4 mr-2" />
            Upload Slides
          </Button>
          <Button onClick={onCreateFile} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            New File
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files, courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isOnboardingActive ? 'Welcome to StudyCards!' : 'No study files yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isOnboardingActive 
              ? 'Let\'s get you started by creating your first study file to organize your courses and flashcards.'
              : 'Create your first study file to get started with organizing your flashcards.'
            }
          </p>
          <Button 
            onClick={onCreateFile} 
            className={`bg-primary hover:bg-primary-dark ${
              isOnboardingActive && currentStep === 'create-file' ? 'animate-pulse ring-2 ring-primary ring-opacity-50' : ''
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isOnboardingActive ? 'Create Your First File' : 'Create Study File'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onClick={() => onFileSelect(file)}
            />
          ))}
        </div>
      )}
    </div>
  );
}