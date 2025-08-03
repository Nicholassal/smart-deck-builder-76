import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Copy, Palette, Edit2, FolderInput, Trash2 } from 'lucide-react';
import { StudyFile } from '@/types/flashcard';
import { useDataStore } from '@/hooks/useDataStore';
import { toast } from 'sonner';

interface FileMenuProps {
  file: StudyFile;
  onRename?: () => void;
}

const FILE_COLORS = [
  { name: 'Blue', value: 'bg-blue-500', class: 'from-blue-500 to-blue-600' },
  { name: 'Green', value: 'bg-green-500', class: 'from-green-500 to-green-600' },
  { name: 'Purple', value: 'bg-purple-500', class: 'from-purple-500 to-purple-600' },
  { name: 'Red', value: 'bg-red-500', class: 'from-red-500 to-red-600' },
  { name: 'Orange', value: 'bg-orange-500', class: 'from-orange-500 to-orange-600' },
  { name: 'Pink', value: 'bg-pink-500', class: 'from-pink-500 to-pink-600' },
  { name: 'Indigo', value: 'bg-indigo-500', class: 'from-indigo-500 to-indigo-600' },
  { name: 'Teal', value: 'bg-teal-500', class: 'from-teal-500 to-teal-600' },
];

export function FileMenu({ file, onRename }: FileMenuProps) {
  const { files, updateFile, deleteFile, duplicateFile } = useDataStore();
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [selectedColor, setSelectedColor] = useState(file.color || FILE_COLORS[0].value);
  const [targetFileId, setTargetFileId] = useState<string>('');

  const handleDuplicate = async () => {
    try {
      await duplicateFile(file.id);
      toast.success('File duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate file');
    }
  };

  const handleColorChange = async () => {
    try {
      await updateFile(file.id, { color: selectedColor });
      setShowColorDialog(false);
      toast.success('File color updated');
    } catch (error) {
      toast.error('Failed to update file color');
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }
    
    try {
      await updateFile(file.id, { name: newName.trim() });
      setShowRenameDialog(false);
      toast.success('File renamed successfully');
      onRename?.();
    } catch (error) {
      toast.error('Failed to rename file');
    }
  };

  const handleMove = async () => {
    if (!targetFileId) {
      toast.error('Please select a target file');
      return;
    }

    try {
      const targetFile = files.find(f => f.id === targetFileId);
      if (!targetFile) {
        toast.error('Target file not found');
        return;
      }

      // Move all decks from source file to target file
      const updatedTargetDecks = [...targetFile.decks, ...file.decks];
      await updateFile(targetFileId, { decks: updatedTargetDecks });
      await deleteFile(file.id);
      
      setShowMoveDialog(false);
      toast.success(`Moved all content to ${targetFile.name}`);
    } catch (error) {
      toast.error('Failed to move file content');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFile(file.id);
      setShowDeleteDialog(false);
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const otherFiles = files.filter(f => f.id !== file.id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowColorDialog(true)}>
            <Palette className="mr-2 h-4 w-4" />
            Change Color
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          {otherFiles.length > 0 && (
            <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
              <FolderInput className="mr-2 h-4 w-4" />
              Move to File
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Dialog */}
      <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change File Color</DialogTitle>
            <DialogDescription>
              Choose a color for your file to help organize your courses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-3 py-4">
            {FILE_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`h-12 rounded-lg border-2 transition-all ${
                  selectedColor === color.value 
                    ? 'border-primary scale-105' 
                    : 'border-transparent hover:border-muted-foreground'
                } ${color.value}`}
              >
                <span className="sr-only">{color.name}</span>
              </button>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowColorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleColorChange}>
              Save Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for your file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter file name"
              className="mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move File Content</DialogTitle>
            <DialogDescription>
              Select a file to move all content from "{file.name}" into. This will delete the current file and merge all its decks into the target file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="targetFile">Target File</Label>
            <Select value={targetFileId} onValueChange={setTargetFileId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a file to move content to" />
              </SelectTrigger>
              <SelectContent>
                {otherFiles.map((targetFile) => (
                  <SelectItem key={targetFile.id} value={targetFile.id}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${targetFile.color || 'bg-gray-500'}`} />
                      <span>{targetFile.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {targetFile.decks.length} decks
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} variant="destructive">
              Move Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{file.name}"? This will permanently remove the file and all its decks and flashcards. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}