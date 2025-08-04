import { useState, useEffect } from 'react';
import { Search, Filter, Upload, TrendingUp, Star, Download, Eye, ChevronLeft, ChevronRight, Users, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { MarketplaceFileCard } from '@/components/marketplace/MarketplaceFileCard';
import { TagFilter } from '@/components/marketplace/TagFilter';
import { Leaderboard } from '@/components/marketplace/Leaderboard';
import { UploadDialog } from '@/components/marketplace/UploadDialog';
import { MarketplaceFilters, MarketplaceFile } from '@/types/marketplace';


// Mock data - Replace with Supabase queries
const mockFiles: MarketplaceFile[] = [
  {
    id: '1',
    name: 'Calculus I Complete Study Guide',
    description: 'Comprehensive flashcards covering limits, derivatives, and integrals',
    tags: [
      { id: '1', name: 'Mathematics', category: 'subject', color: '#3b82f6', usageCount: 150 },
      { id: '2', name: 'Calculus', category: 'subject', color: '#8b5cf6', usageCount: 89 }
    ],
    authorId: 'user1',
    authorName: 'Prof. Smith',
    authorPoints: 2450,
    uploadDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-20'),
    downloadCount: 234,
    upvotes: 89,
    downvotes: 3,
    fileSize: '2.3 MB',
    deckCount: 5,
    cardCount: 156,
    featured: true,
    verified: true
  },
  {
    id: '2',
    name: 'Biology Cell Structure',
    description: 'Detailed flashcards about cell components and their functions',
    tags: [
      { id: '3', name: 'Biology', category: 'subject', color: '#10b981', usageCount: 120 },
      { id: '4', name: 'Beginner', category: 'level', color: '#f59e0b', usageCount: 200 }
    ],
    authorId: 'user2',
    authorName: 'Dr. Johnson',
    authorPoints: 1890,
    uploadDate: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-12'),
    downloadCount: 156,
    upvotes: 67,
    downvotes: 2,
    fileSize: '1.8 MB',
    deckCount: 3,
    cardCount: 89,
    featured: false,
    verified: true
  }
];

type ViewMode = 'browse' | 'leaderboard';

export function ShopView() {
  return <EnhancedShopView />;
}

function EnhancedShopView() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    tags: [],
    sortBy: 'popular',
    dateRange: 'all',
    verified: null,
    featured: null
  });
  const [files, setFiles] = useState<MarketplaceFile[]>(mockFiles);

  const handleSwipeToLeaderboard = () => setViewMode('leaderboard');
  const handleSwipeToBrowse = () => setViewMode('browse');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="relative z-10">
        <FirstVisitTooltip
          page="shop"
          title="Welcome to the Study Shop!"
          description="Browse and download flashcard collections, upload your own, and compete on the leaderboard! Swipe right to see rankings."
        />
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center justify-between mb-6 md:hidden">
        <div className="flex items-center gap-2">
          {viewMode === 'leaderboard' && (
            <Button variant="ghost" size="sm" onClick={handleSwipeToBrowse}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Browse
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {viewMode === 'browse' ? 'Study Shop' : 'Leaderboard'}
          </h1>
        </div>
        {viewMode === 'browse' && (
          <Button variant="ghost" size="sm" onClick={handleSwipeToLeaderboard}>
            Rankings
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Shop</h1>
          <p className="text-muted-foreground">
            Discover and share study materials with the community
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="mt-4 lg:mt-0">
          <Upload className="h-4 w-4 mr-2" />
          Upload Study File
        </Button>
      </div>

      {viewMode === 'browse' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Files</p>
                    <p className="text-lg md:text-2xl font-bold">1,234</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Downloads</p>
                    <p className="text-lg md:text-2xl font-bold">45.6K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Users</p>
                    <p className="text-lg md:text-2xl font-bold">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Top Points</p>
                    <p className="text-lg md:text-2xl font-bold">9,999</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Upload Button */}
          <div className="md:hidden mb-6">
            <Button onClick={() => setShowUploadDialog(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Study File
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={(value: any) => setFilters({...filters, sortBy: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="downloads">Most Downloaded</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TagFilter 
                    selectedTags={filters.tags}
                    onTagChange={(tags) => setFilters({...filters, tags})}
                  />

                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={filters.verified === true}
                        onChange={(e) => setFilters({...filters, verified: e.target.checked ? true : null})}
                      />
                      <label htmlFor="verified" className="text-sm">Verified only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={filters.featured === true}
                        onChange={(e) => setFilters({...filters, featured: e.target.checked ? true : null})}
                      />
                      <label htmlFor="featured" className="text-sm">Featured only</label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Desktop Leaderboard */}
              <div className="mt-6">
                <Leaderboard />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search study files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden mb-6 space-y-4">
                <div className="flex gap-2">
                  <Select value={filters.sortBy} onValueChange={(value: any) => setFilters({...filters, sortBy: value})}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="downloads">Most Downloaded</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {files.map((file) => (
                  <MarketplaceFileCard 
                    key={file.id} 
                    file={file}
                    onDownload={() => {
                      // TODO: Implement download with Supabase
                      console.log('Download file:', file.id);
                    }}
                    onVote={(type) => {
                      // TODO: Implement voting with Supabase
                      console.log('Vote:', type, 'for file:', file.id);
                    }}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline">
                  Load More Files
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Leaderboard View */
        <div className="max-w-2xl mx-auto">
          <Leaderboard />
        </div>
      )}

      <UploadDialog 
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
    </div>
  );
}