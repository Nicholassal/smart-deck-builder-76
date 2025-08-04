// Marketplace types for the community file sharing feature
// NOTE: These interfaces define the structure but require Supabase backend implementation

export interface MarketplaceTag {
  id: string;
  name: string;
  category: 'subject' | 'level' | 'language' | 'custom';
  color: string;
  usageCount: number;
}

export interface MarketplaceFile {
  id: string;
  name: string;
  description: string;
  tags: MarketplaceTag[];
  authorId: string; // Requires user authentication
  authorName: string;
  authorPoints: number;
  uploadDate: Date;
  lastUpdated: Date;
  downloadCount: number;
  upvotes: number;
  downvotes: number;
  fileSize: string;
  deckCount: number;
  cardCount: number;
  previewImage?: string;
  featured: boolean;
  verified: boolean;
  // The actual file data would be stored in Supabase storage
  fileData?: any; // StudyFile data structure
}

export interface MarketplaceVote {
  id: string;
  fileId: string;
  userId: string; // Requires user authentication
  voteType: 'upvote' | 'downvote';
  timestamp: Date;
}

export interface MarketplaceDownload {
  id: string;
  fileId: string;
  userId: string; // Requires user authentication
  timestamp: Date;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  uploadsCount: number;
  downloadsReceived: number;
  upvotesReceived: number;
  rank: number;
}

export interface MarketplaceStats {
  totalFiles: number;
  totalDownloads: number;
  totalUsers: number;
  topTags: MarketplaceTag[];
  recentActivity: {
    uploads: number;
    downloads: number;
    votes: number;
  };
}

// Search and filter interfaces
export interface MarketplaceFilters {
  tags: string[];
  sortBy: 'newest' | 'popular' | 'downloads' | 'rating';
  dateRange: 'all' | 'week' | 'month' | 'year';
  verified: boolean | null;
  featured: boolean | null;
}

export interface MarketplaceSearchResult {
  files: MarketplaceFile[];
  totalCount: number;
  hasMore: boolean;
  filters: MarketplaceFilters;
}