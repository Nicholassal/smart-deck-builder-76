import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ThumbsUp, ThumbsDown, Star, Calendar, User, FileText, Layers } from 'lucide-react';
import { MarketplaceFile } from '@/types/marketplace';

interface MarketplaceFileCardProps {
  file: MarketplaceFile;
  onDownload: () => void;
  onVote: (type: 'upvote' | 'downvote') => void;
}

export function MarketplaceFileCard({ file, onDownload, onVote }: MarketplaceFileCardProps) {
  const rating = file.upvotes + file.downvotes > 0 
    ? (file.upvotes / (file.upvotes + file.downvotes)) * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight mb-2">
              {file.name}
              {file.featured && <Star className="inline-block h-4 w-4 text-yellow-500 ml-2" />}
              {file.verified && <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {file.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {file.tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
          {file.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{file.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{file.authorName}</span>
          <span>•</span>
          <span>{file.authorPoints} pts</span>
        </div>

        {/* File Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>{file.deckCount} modules</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{file.cardCount} cards</span>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>{file.downloadCount} downloads</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{file.uploadDate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onVote('upvote')}
              className="p-1 h-auto"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs">{file.upvotes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onVote('downvote')}
              className="p-1 h-auto"
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span className="text-xs">{file.downvotes}</span>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {rating.toFixed(0)}% positive
          </div>
        </div>

        {/* Download Button */}
        <Button 
          onClick={onDownload}
          className="w-full"
          variant={file.featured ? "default" : "outline"}
        >
          <Download className="h-4 w-4 mr-2" />
          Download ({file.fileSize})
        </Button>
      </CardContent>
    </Card>
  );
}