# Backend Implementation Guide

This document outlines all the backend integrations needed to complete the StudyCards application functionality.

## 1. AI Tutor (TutorView.tsx)

### Required APIs:
- **LLM Integration (OpenAI/Anthropic)**
- **Speech-to-Text (STT)**  
- **Text-to-Speech (TTS)**
- **Knowledge Base Retrieval**

### Endpoints Needed:

#### 1.1 LLM Question Generation
```
POST /api/tutor/ask-question
Headers: Authorization: Bearer [API_KEY]
Body: {
  fileId: string,
  deckId?: string,
  difficulty: 'easy' | 'medium' | 'hard',
  previousQuestions: string[],
  knowledgeBase: string[] // PDF content summaries
}
Response: {
  question: string,
  expectedAnswer: string,
  context: string,
  sources: string[],
  difficulty: 'easy' | 'medium' | 'hard'
}
```

#### 1.2 Speech-to-Text
```
POST /api/speech/transcribe
Headers: Authorization: Bearer [API_KEY]
Body: FormData with audio blob
Response: {
  transcription: string,
  confidence: number
}
```

#### 1.3 Text-to-Speech
```
POST /api/speech/synthesize
Headers: Authorization: Bearer [API_KEY]
Body: {
  text: string,
  voice: string,
  speed: number
}
Response: Audio blob
```

#### 1.4 Knowledge Base Context
```
GET /api/knowledge/context?fileId=x&query=y&limit=5
Response: {
  contexts: [{
    text: string,
    source: string,
    relevance: number
  }]
}
```

### Required Environment Variables:
```
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=el_...
DEEPGRAM_API_KEY=... (or use OpenAI Whisper)
```

## 2. PDF Processing Service

### Current Status: 
- Interface defined in `src/services/PdfProcessingService.ts`
- Needs actual implementation

### Required Implementation:
```typescript
// TODO: Implement PDF text extraction
static async extractTextFromPdf(file: File): Promise<string> {
  // Use pdf-parse or similar library
  // Return extracted text content
}

// TODO: Implement API call for flashcard generation
static async generateFlashcards(text: string, options: ProcessingOptions): Promise<ProcessingResult> {
  // Call OpenAI/Anthropic API to generate flashcards from text
  // Use the text as knowledge base for questions
}
```

## 3. AI Model Service

### Current Status:
- Service structure exists in `src/services/AiModelService.ts`
- API calls need implementation

### Required Implementation:
```typescript
// TODO: Implement actual API calls
static async callOpenAI(systemPrompt: string, userPrompt: string, provider: AiProvider) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  // Parse and return flashcards
}
```

## 4. Marketplace/Shop Features

### Required Supabase Tables:

#### marketplace_files
```sql
CREATE TABLE marketplace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id),
  file_data JSONB, -- Deck/flashcard data
  tags TEXT[],
  upload_date TIMESTAMP DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE
);
```

#### marketplace_downloads
```sql
CREATE TABLE marketplace_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES marketplace_files(id),
  user_id UUID REFERENCES auth.users(id),
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

#### marketplace_votes
```sql
CREATE TABLE marketplace_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES marketplace_files(id),
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(file_id, user_id)
);
```

### Required API Endpoints:
```
GET /api/marketplace/files - List marketplace files
POST /api/marketplace/upload - Upload study file
POST /api/marketplace/download/:id - Download file
POST /api/marketplace/vote - Vote on file
GET /api/marketplace/leaderboard - User points leaderboard
```

## 5. Study Scheduler Backend

### Required Implementation:
- File: `src/services/StudySchedulerService.ts` needs actual API calls
- Integration with calendar systems
- Email/notification system

### Required Endpoints:
```
POST /api/scheduler/create-plan
GET /api/scheduler/plans
PUT /api/scheduler/update-progress
DELETE /api/scheduler/plan/:id
```

## 6. Data Persistence (Supabase)

### Required Tables:

#### study_files
```sql
CREATE TABLE study_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  semester TEXT,
  year INTEGER,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### decks
```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES study_files(id),
  name TEXT NOT NULL,
  course_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### sections
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id),
  name TEXT NOT NULL,
  week INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### flashcards
```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  image_url TEXT,
  image_masks JSONB,
  difficulty TEXT DEFAULT 'medium',
  fsrs_data JSONB, -- FSRS algorithm data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### study_sessions
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID REFERENCES flashcards(id),
  user_id UUID REFERENCES auth.users(id),
  response TEXT, -- 'again', 'hard', 'good', 'easy'
  response_time INTEGER, -- milliseconds
  is_correct BOOLEAN,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 7. File Upload & Storage

### Required Implementation:
- PDF upload to Supabase Storage
- Image upload for flashcards
- File processing pipeline

### Supabase Storage Buckets:
```
- pdfs (for uploaded study materials)
- flashcard-images (for image-based flashcards)
- user-uploads (general file uploads)
```

## 8. Authentication Integration

### Required:
- Supabase Auth setup
- User profile management
- Session handling

## 9. Real-time Features

### WebSocket/Real-time Updates:
- Study progress sync across devices
- Live leaderboard updates
- Collaborative study sessions

## Implementation Priority:

1. **High Priority:**
   - AI Tutor LLM integration
   - PDF processing pipeline
   - Basic data persistence (Supabase tables)
   - Authentication

2. **Medium Priority:**
   - Marketplace functionality
   - Speech-to-text/text-to-speech
   - Study scheduler API

3. **Low Priority:**
   - Real-time features
   - Advanced analytics
   - Collaborative features

## Environment Variables Needed:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# AI Services (add to Supabase secrets)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=el_...
DEEPGRAM_API_KEY=...

# Optional
AZURE_SPEECH_KEY=...
GOOGLE_CLOUD_API_KEY=...
```

## Getting Started:

1. Set up Supabase tables using the SQL schemas above
2. Add API keys to Supabase Edge Function secrets
3. Implement the AI Tutor endpoints first (highest user value)
4. Create Supabase Edge Functions for each API endpoint
5. Test with the existing frontend components

Each component has TODO comments indicating where backend integration is needed.