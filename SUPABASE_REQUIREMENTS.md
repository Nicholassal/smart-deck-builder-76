# Supabase Requirements for Marketplace Feature

This document outlines all the database tables, policies, and backend functionality needed to implement the marketplace feature.

## Required Database Tables

### 1. marketplace_files
```sql
CREATE TABLE marketplace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  file_size TEXT,
  deck_count INTEGER DEFAULT 0,
  card_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  file_data JSONB, -- Stores the actual StudyFile JSON data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. marketplace_tags
```sql
CREATE TABLE marketplace_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subject', 'level', 'language', 'custom')),
  color TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. marketplace_file_tags (Junction table)
```sql
CREATE TABLE marketplace_file_tags (
  file_id UUID REFERENCES marketplace_files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES marketplace_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (file_id, tag_id)
);
```

### 4. marketplace_votes
```sql
CREATE TABLE marketplace_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES marketplace_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(file_id, user_id)
);
```

### 5. marketplace_downloads
```sql
CREATE TABLE marketplace_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES marketplace_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. user_points
```sql
CREATE TABLE user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  downloads_received INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Required Row Level Security (RLS) Policies

### marketplace_files
- `SELECT`: Public read access for all files
- `INSERT`: Authenticated users can upload files
- `UPDATE`: Only file authors can update their files
- `DELETE`: Only file authors can delete their files

### marketplace_votes
- `SELECT`: Users can see all votes
- `INSERT`: Authenticated users can vote (prevent double voting)
- `UPDATE`: Users can change their vote
- `DELETE`: Users can remove their vote

### marketplace_downloads
- `SELECT`: Users can see download counts but not individual download records
- `INSERT`: Authenticated users can download files

## Required Edge Functions

### 1. Handle File Upload
```typescript
// Processes uploaded files, validates data, updates counters
```

### 2. Handle Voting
```typescript
// Manages upvotes/downvotes, updates user points, prevents duplicate votes
```

### 3. Handle Downloads
```typescript
// Records downloads, updates counters, awards points to file authors
```

### 4. Update User Rankings
```typescript
// Calculates and updates user rankings based on points
```

### 5. Search and Filter Files
```typescript
// Advanced search with tag filtering, sorting, pagination
```

## Points System Implementation

### Point Values
- **Upload**: 10 points per file uploaded
- **Download received**: 5 points per download of your file
- **Upvote received**: 3 points per upvote on your file
- **Downvote received**: -1 point per downvote on your file

### Ranking Calculation
- Users ranked by total points
- Ties broken by total downloads received
- Rankings updated daily via scheduled function

## Required Functions/Triggers

### Update Counters Trigger
```sql
-- Automatically update vote counts when votes are added/removed
-- Update download counts when downloads are recorded
-- Update user points when actions occur
```

### Tag Usage Counter
```sql
-- Update tag usage_count when files are tagged/untagged
```

## Authentication Requirements

The marketplace requires user authentication to:
- Upload files
- Vote on files
- Download files
- Track user points and rankings
- Prevent duplicate votes/downloads

## Storage Requirements

- File data stored as JSONB in database
- Optional: Store file previews/thumbnails in Supabase Storage
- File size tracking for display purposes

## API Endpoints Needed

### Files
- `GET /marketplace/files` - List files with filters
- `POST /marketplace/files` - Upload new file
- `GET /marketplace/files/:id` - Get specific file
- `PUT /marketplace/files/:id` - Update file (author only)
- `DELETE /marketplace/files/:id` - Delete file (author only)

### Voting
- `POST /marketplace/files/:id/vote` - Vote on file
- `DELETE /marketplace/files/:id/vote` - Remove vote

### Downloads
- `POST /marketplace/files/:id/download` - Download file
- `GET /marketplace/files/:id/download-url` - Get download URL

### Tags
- `GET /marketplace/tags` - List all tags
- `POST /marketplace/tags` - Create new tag

### Leaderboard
- `GET /marketplace/leaderboard` - Get top users by points

### Stats
- `GET /marketplace/stats` - Get marketplace statistics

## Implementation Order

1. Set up authentication (if not already done)
2. Create database tables and RLS policies
3. Implement file upload functionality
4. Add voting system
5. Implement download tracking
6. Create points calculation system
7. Build search and filtering
8. Add leaderboard functionality
9. Implement tag system
10. Add admin features (featured/verified files)