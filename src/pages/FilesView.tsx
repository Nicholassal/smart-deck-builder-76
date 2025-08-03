import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText } from 'lucide-react';
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 items-start justify-between">
        <div className="text-center sm:text-left w-full">
          <h1 className="text-2xl sm:text-3xl font-bold">Study Files</h1>
          <p className="text-muted-foreground">Organize your courses by semester</p>
        </div>
        
        <div className="w-full flex justify-center sm:justify-end">
          <Button onClick={onCreateFile} className="bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            Create New File
          </Button>
        </div>
      </div>

      <div className="relative max-w-md mx-auto sm:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files, courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="max-w-md mx-auto">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No study files yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first study file to start organizing your courses and flashcards.
            </p>
            <Button onClick={onCreateFile} className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First File
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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