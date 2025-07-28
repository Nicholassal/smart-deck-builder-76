import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { FilesView } from '@/pages/FilesView';
import { StatsView } from '@/pages/StatsView';
import { StudyFile } from '@/types/flashcard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { OnboardingProvider, useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay';
import { DataStoreProvider, useDataStore } from '@/hooks/useDataStore';
import { FileDetailView } from '@/pages/FileDetailView';

function IndexContent() {
  const [currentView, setCurrentView] = useState<'files' | 'stats' | 'settings'>('files');
  const [showCreateFileDialog, setShowCreateFileDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileSemester, setNewFileSemester] = useState('');
  const [newFileYear, setNewFileYear] = useState(new Date().getFullYear().toString());
  
  const { toast } = useToast();
  const { createFile, setCurrentFile } = useDataStore();
  const { setCreatedIds, nextStep } = useOnboarding();

  const handleFileSelect = (file: StudyFile) => {
    setSelectedFile(file);
    setCurrentFile(file);
  };

  const handleCreateFile = () => {
    setShowCreateFileDialog(true);
  };

  const handleCreateFileSubmit = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      });
      return;
    }

    const newFile = createFile(
      newFileName.trim(),
      newFileSemester || undefined,
      parseInt(newFileYear) || undefined
    );

    setCreatedIds(newFile.id);
    nextStep();
    
    toast({
      title: "File Created",
      description: `Study file "${newFileName}" has been created!`,
    });
    
    setShowCreateFileDialog(false);
    setNewFileName('');
    setNewFileSemester('');
    setNewFileYear(new Date().getFullYear().toString());
  };

  const renderCurrentView = () => {
    if (selectedFile) {
      return <FileDetailView file={selectedFile} onBack={() => setSelectedFile(null)} />;
    }
    
    switch (currentView) {
      case 'files':
        return <FilesView onFileSelect={handleFileSelect} onCreateFile={handleCreateFile} />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <FilesView onFileSelect={handleFileSelect} onCreateFile={handleCreateFile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation 
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateFile={handleCreateFile}
      />
      
      <div className="flex-1 md:ml-0">
        {renderCurrentView()}
      </div>

      <OnboardingOverlay />

      {/* Create File Dialog */}
      <Dialog open={showCreateFileDialog} onOpenChange={setShowCreateFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Study File</DialogTitle>
            <DialogDescription>
              Create a new study file to organize your courses and flashcards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                placeholder="e.g., Computer Science Fall 2024"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={newFileSemester} onValueChange={setNewFileSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newFileYear}
                  onChange={(e) => setNewFileYear(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateFileDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFileSubmit} className="bg-primary hover:bg-primary-dark">
              Create File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Index = () => {
  return (
    <DataStoreProvider>
      <OnboardingProvider>
        <IndexContent />
      </OnboardingProvider>
    </DataStoreProvider>
  );
};

export default Index;
