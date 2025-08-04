# Implementation Prompts for Marketplace Feature

## When Supabase is Connected - Use These Prompts

### 1. Database Setup
```
Create all the database tables and RLS policies from SUPABASE_REQUIREMENTS.md. Set up:
- marketplace_files table with proper columns
- marketplace_tags and marketplace_file_tags junction table  
- marketplace_votes and marketplace_downloads tables
- user_points table for the ranking system
- All RLS policies for proper security
```

### 2. Authentication Integration
```
Update the marketplace components to integrate with Supabase auth:
- Replace mock user data with real auth.user() calls
- Add login requirements for uploading, voting, downloading
- Show user-specific data (their uploads, votes, etc.)
```

### 3. File Upload Backend
```
Implement the file upload functionality:
- Create edge function to handle file uploads to marketplace_files table
- Process and validate StudyFile JSON data
- Generate file statistics (deck count, card count, file size)
- Handle tag creation and association
```

### 4. Voting System Backend
```
Implement the voting system:
- Create edge function for upvote/downvote handling
- Prevent duplicate votes (one vote per user per file)
- Update file vote counters and user points automatically
- Allow users to change their vote
```

### 5. Download System Backend
```
Implement file download tracking:
- Record downloads in marketplace_downloads table
- Update download counters on files
- Award points to file authors for downloads
- Return the StudyFile JSON data for import
```

### 6. Search and Filtering Backend
```
Create advanced search functionality:
- Build search query with tag filtering
- Implement sorting by popularity, downloads, date, rating
- Add pagination for large result sets
- Create tag management and auto-completion
```

### 7. Points and Ranking System
```
Implement the points and ranking system:
- Create triggers to automatically update user_points table
- Build leaderboard queries with proper ranking
- Add point awards for uploads, downloads received, votes received
- Create scheduled function to update rankings daily
```

### 8. Real-time Features
```
Add real-time functionality:
- Live update of vote counts and download numbers
- Real-time leaderboard updates
- Notifications for when your files get downloaded/voted on
```

## Current Status (Supabase Not Connected)

✅ **Completed Infrastructure:**
- All React components built and styled
- Complete UI for file browsing, uploading, voting
- Mock data and interfaces defined
- Navigation and routing implemented
- Search and filtering UI components
- Tag system UI
- Leaderboard component
- Upload dialog with file selection

⚠️ **Missing (Requires Supabase):**
- Database storage and retrieval
- User authentication
- Real voting and download tracking
- Points calculation and rankings
- File upload processing
- Search functionality
- Tag management

## Quick Start After Supabase Connection

1. Run the database setup SQL from SUPABASE_REQUIREMENTS.md
2. Use the prompts above to implement each backend feature
3. Test the authentication flow
4. Verify file upload and download functionality
5. Test voting and points system
6. Launch the marketplace!

The entire frontend is ready - just needs the backend integration!