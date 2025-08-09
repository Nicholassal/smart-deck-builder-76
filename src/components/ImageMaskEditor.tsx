import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Move, Expand, Palette, Trash2 } from 'lucide-react';
import { ImageMask } from '@/types/flashcard';

interface ImageMaskEditorProps {
  imageUrl: string;
  masks: ImageMask[];
  onMasksChange: (masks: ImageMask[]) => void;
  onClose: () => void;
}

type EditMode = 'create' | 'resize' | 'move';

const MASK_COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
];

export function ImageMaskEditor({ imageUrl, masks, onMasksChange, onClose }: ImageMaskEditorProps) {
  const [localMasks, setLocalMasks] = useState<ImageMask[]>(masks);
  const [selectedMask, setSelectedMask] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('create');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; imageX: number; imageY: number } | null>(null);
  const [newMaskColor, setNewMaskColor] = useState(MASK_COLORS[0]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    redrawCanvas();
  }, [imageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [localMasks, selectedMask]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match container
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = (img.height / img.width) * containerRect.width;

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw masks (masks use percentage coordinates 0-100)
      localMasks.forEach(mask => {
        const maskX = (mask.x / 100) * canvas.width;
        const maskY = (mask.y / 100) * canvas.height;
        const maskWidth = (mask.width / 100) * canvas.width;
        const maskHeight = (mask.height / 100) * canvas.height;
        
        ctx.fillStyle = mask.color + '80'; // Semi-transparent
        ctx.fillRect(maskX, maskY, maskWidth, maskHeight);

        // Draw selection border
        if (selectedMask === mask.id) {
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(maskX, maskY, maskWidth, maskHeight);
          ctx.setLineDash([]);
        }
      });
    };
    img.src = imageUrl;
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, imageX: 0, imageY: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    // Convert to image coordinates (0-100 percentage) based on canvas dimensions
    const imageX = (x / canvas.width) * 100;
    const imageY = (y / canvas.height) * 100;

    return { x, y, imageX, imageY };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(event);
    setDragStart(coords);
    setIsDrawing(true);

    if (editMode === 'create') {
      setSelectedMask(null);
    } else {
      // Check if clicking on existing mask (using percentage coordinates)
      const clickedMask = localMasks.find(mask => 
        coords.imageX >= mask.x && coords.imageX <= mask.x + mask.width &&
        coords.imageY >= mask.y && coords.imageY <= mask.y + mask.height
      );
      
      if (clickedMask) {
        setSelectedMask(clickedMask.id);
      } else {
        setSelectedMask(null);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;

    const coords = getCanvasCoordinates(event);

    if (editMode === 'move' && selectedMask) {
      // Move selected mask (using percentage coordinates)
      const dx = coords.imageX - dragStart.imageX;
      const dy = coords.imageY - dragStart.imageY;

      setLocalMasks(prev => prev.map(mask => 
        mask.id === selectedMask 
          ? { 
              ...mask, 
              x: Math.max(0, Math.min(100 - mask.width, mask.x + dx)), 
              y: Math.max(0, Math.min(100 - mask.height, mask.y + dy)) 
            }
          : mask
      ));

      setDragStart(coords);
    } else if (editMode === 'resize' && selectedMask) {
      // Resize selected mask
      const selectedMaskData = localMasks.find(m => m.id === selectedMask);
      if (selectedMaskData) {
        const newWidth = Math.abs(coords.imageX - selectedMaskData.x);
        const newHeight = Math.abs(coords.imageY - selectedMaskData.y);

        setLocalMasks(prev => prev.map(mask => 
          mask.id === selectedMask 
            ? { 
                ...mask, 
                width: Math.min(100 - mask.x, Math.max(5, newWidth)), 
                height: Math.min(100 - mask.y, Math.max(5, newHeight)) 
              }
            : mask
        ));
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;

    const coords = getCanvasCoordinates(event);

    if (editMode === 'create') {
      const width = Math.abs(coords.imageX - dragStart.imageX);
      const height = Math.abs(coords.imageY - dragStart.imageY);
      
      if (width > 1 && height > 1) { // Minimum size (1% of image)
        const x = Math.min(coords.imageX, dragStart.imageX);
        const y = Math.min(coords.imageY, dragStart.imageY);

        const newMask: ImageMask = {
          id: Date.now().toString(),
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(100 - x, width),
          height: Math.min(100 - y, height),
          color: newMaskColor,
          isVisible: true
        };

        console.log('Creating mask:', newMask);
        setLocalMasks(prev => {
          const updated = [...prev, newMask];
          console.log('Updated masks:', updated);
          return updated;
        });
        setSelectedMask(newMask.id);
        setEditMode('move'); // Switch to move mode after creation
      }
    }

    setIsDrawing(false);
    setDragStart(null);
  };

  const deleteMask = (maskId: string) => {
    setLocalMasks(prev => prev.filter(mask => mask.id !== maskId));
    if (selectedMask === maskId) {
      setSelectedMask(null);
    }
  };

  const handleSave = () => {
    onMasksChange(localMasks);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Edit Image Masks</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={editMode === 'create' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
            <Button
              variant={editMode === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode('move')}
              disabled={!selectedMask}
            >
              <Move className="h-4 w-4 mr-2" />
              Move
            </Button>
            <Button
              variant={editMode === 'resize' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode('resize')}
              disabled={!selectedMask}
            >
              <Expand className="h-4 w-4 mr-2" />
              Resize
            </Button>
          </div>

          {/* Color Picker */}
          {editMode === 'create' && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">Color:</Label>
              <div className="flex gap-1">
                {MASK_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${newMaskColor === color ? 'border-primary' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewMaskColor(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex">
            {/* Image Canvas */}
            <div ref={containerRef} className="flex-1 relative bg-gray-100">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[60vh] cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            </div>

            {/* Mask List */}
            <div className="w-64 border-l bg-muted/20 p-4 max-h-[60vh] overflow-y-auto">
              <h3 className="font-semibold mb-3">Masks ({localMasks.length})</h3>
              
              {localMasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No masks created yet</p>
              ) : (
                <div className="space-y-2">
                  {localMasks.map((mask, index) => (
                    <div
                      key={mask.id}
                      className={`p-3 rounded border cursor-pointer ${
                        selectedMask === mask.id ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setSelectedMask(mask.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: mask.color }}
                          />
                          <span className="text-sm font-medium">Mask {index + 1}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMask(mask.id);
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(mask.width)} × {Math.round(mask.height)}px
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-muted/30 border-t">
            <div className="text-sm text-muted-foreground">
              {editMode === 'create' && "Click and drag to create a new mask"}
              {editMode === 'move' && "Click and drag a mask to move it"}
              {editMode === 'resize' && "Click and drag from a corner to resize the selected mask"}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Masks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}