import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Plus, Tag } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const { files } = useDataStore();
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !description.trim()) {
      return;
    }

    // TODO: Implement Supabase upload
    console.log('Uploading file:', {
      file: selectedFile,
      title,
      description,
      tags,
      isPublic
    });

    // Reset form
    setSelectedFileId('');
    setTitle('');
    setDescription('');
    setTags([]);
    setNewTag('');
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedFileId('');
    setTitle('');
    setDescription('');
    setTags([]);
    setNewTag('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Study File</DialogTitle>
          <DialogDescription>
            Upload your study file to the community marketplace. Earn points for downloads and positive votes!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <Label htmlFor="file-select">Select Study File</Label>
            <Select value={selectedFileId} onValueChange={setSelectedFileId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a file to upload..." />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center space-x-2">
                      <span>{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({file.decks.length} modules, {file.decks.reduce((sum, deck) => 
                          sum + deck.sections.reduce((sectionSum, section) => 
                            sectionSum + section.flashcards.length, 0), 0)} cards)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">File Preview</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>📁 {selectedFile.name}</p>
                <p>📚 {selectedFile.decks.length} modules</p>
                <p>🃏 {selectedFile.decks.reduce((sum, deck) => 
                  sum + deck.sections.reduce((sectionSum, section) => 
                    sectionSum + section.flashcards.length, 0), 0)} total flashcards</p>
                {selectedFile.semester && (
                  <p>📅 {selectedFile.semester} {selectedFile.year}</p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Complete Calculus I Study Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what's included in your study file and what topics it covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a tag (e.g., Mathematics, Beginner, etc.)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add relevant tags to help others find your content
            </p>
          </div>

          {/* Privacy */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <Label htmlFor="public" className="text-sm">
              Make this file publicly available in the marketplace
            </Label>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || !description.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload to Marketplace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}