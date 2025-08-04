import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';

// Mock popular tags - Replace with Supabase query
const popularTags = [
  { id: '1', name: 'Mathematics', category: 'subject', color: '#3b82f6', usageCount: 150 },
  { id: '2', name: 'Calculus', category: 'subject', color: '#8b5cf6', usageCount: 89 },
  { id: '3', name: 'Biology', category: 'subject', color: '#10b981', usageCount: 76 },
  { id: '4', name: 'Chemistry', category: 'subject', color: '#f59e0b', usageCount: 65 },
  { id: '5', name: 'Physics', category: 'subject', color: '#ef4444', usageCount: 54 },
  { id: '6', name: 'Beginner', category: 'level', color: '#6b7280', usageCount: 123 },
  { id: '7', name: 'Advanced', category: 'level', color: '#374151', usageCount: 87 },
  { id: '8', name: 'English', category: 'language', color: '#8b5cf6', usageCount: 234 },
];

interface TagFilterProps {
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagChange }: TagFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = popularTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTags = filteredTags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof popularTags>);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagChange([...selectedTags, tagName]);
    }
  };

  const clearAllTags = () => {
    onTagChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium">Tags</label>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllTags} className="h-auto p-0 text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedTags.map((tagName) => {
            const tag = popularTags.find(t => t.name === tagName);
            return (
              <Badge 
                key={tagName}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleTag(tagName)}
              >
                {tagName}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search Tags */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
        <Input
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-7 text-xs h-8"
        />
      </div>

      {/* Tag Categories */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {Object.entries(groupedTags).map(([category, tags]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 capitalize">
              {category}
            </h4>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  style={selectedTags.includes(tag.name) ? 
                    { backgroundColor: tag.color, borderColor: tag.color } : 
                    { borderColor: tag.color, color: tag.color }
                  }
                  onClick={() => toggleTag(tag.name)}
                >
                  {tag.name}
                  <span className="ml-1 text-xs opacity-70">({tag.usageCount})</span>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}