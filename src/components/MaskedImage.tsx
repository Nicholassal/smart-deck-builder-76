import { useState } from 'react';
import { ImageMask } from '@/types/flashcard';

interface MaskedImageProps {
  imageUrl: string;
  masks: ImageMask[];
  className?: string;
  isPracticeMode?: boolean;
}

export function MaskedImage({ imageUrl, masks, className = '', isPracticeMode = false }: MaskedImageProps) {
  const [visibleMasks, setVisibleMasks] = useState<Set<string>>(
    new Set(masks.map(mask => mask.id))
  );

  const toggleMask = (maskId: string) => {
    if (!isPracticeMode) return;
    
    setVisibleMasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(maskId)) {
        newSet.delete(maskId);
      } else {
        newSet.add(maskId);
      }
      return newSet;
    });
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img 
        src={imageUrl} 
        alt="Flashcard" 
        className="max-w-full h-auto rounded-lg"
      />
      
      {masks.map(mask => (
        <div
          key={mask.id}
          className={`absolute transition-opacity duration-200 ${
            isPracticeMode ? 'cursor-pointer hover:opacity-75' : ''
          }`}
          style={{
            left: `${(mask.x / 100) * 100}%`,
            top: `${(mask.y / 100) * 100}%`,
            width: `${(mask.width / 100) * 100}%`,
            height: `${(mask.height / 100) * 100}%`,
            backgroundColor: mask.color,
            opacity: visibleMasks.has(mask.id) ? 0.8 : 0,
          }}
          onClick={() => toggleMask(mask.id)}
          title={isPracticeMode ? "Click to reveal/hide" : undefined}
        />
      ))}
      
      {isPracticeMode && masks.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Click masked areas to reveal
        </div>
      )}
    </div>
  );
}