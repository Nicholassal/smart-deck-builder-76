# Study Scheduler Backend Requirements

## Overview
This document outlines the backend implementation needed for the dynamic study scheduler feature. The frontend infrastructure is complete and ready for Supabase integration.

## Database Schema (Supabase Tables)

### 1. study_files
```sql
CREATE TABLE study_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. study_decks
```sql
CREATE TABLE study_decks (
  deck_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES study_files(file_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  est_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. assessments
```sql
CREATE TABLE assessments (
  assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES study_files(file_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(3,1) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. practice_log
```sql
CREATE TABLE practice_log (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES study_decks(deck_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correct_cards INTEGER NOT NULL DEFAULT 0,
  total_cards INTEGER NOT NULL DEFAULT 0
);
```

### 5. daily_plan
```sql
CREATE TABLE daily_plan (
  date DATE NOT NULL,
  deck_id UUID REFERENCES study_decks(deck_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_minutes INTEGER NOT NULL,
  actual_minutes INTEGER,
  status VARCHAR(20) CHECK (status IN ('pending', 'studied', 'skipped')) DEFAULT 'pending',
  PRIMARY KEY (date, deck_id, user_id)
);
```

### 6. deck_metrics (computed daily)
```sql
CREATE TABLE deck_metrics (
  deck_id UUID REFERENCES study_decks(deck_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recency_decay DECIMAL(5,4) DEFAULT 1.0,
  accuracy DECIMAL(5,4) DEFAULT 0.0,
  volume_score INTEGER DEFAULT 0,
  priority_raw DECIMAL(5,4) DEFAULT 0.0,
  difficulty DECIMAL(5,4) DEFAULT 0.5,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (deck_id, user_id)
);
```

## Required Supabase Edge Functions

### 1. get-study-plan
**Path:** `/functions/v1/get-study-plan`
**Purpose:** Returns calendar data for date range
**Response:** JSON matching `StudyPlanResponse` type

### 2. generate-study-plan
**Path:** `/functions/v1/generate-study-plan`
**Purpose:** Creates initial study schedule for assessment
**Algorithm:** Implements weighted round-robin distribution

### 3. mark-study-session
**Path:** `/functions/v1/mark-study-session`
**Purpose:** Records study completion and updates metrics

### 4. reschedule-session
**Path:** `/functions/v1/reschedule-session`
**Purpose:** Handles skipped sessions and rebalancing

### 5. calculate-metrics
**Path:** `/functions/v1/calculate-metrics`
**Purpose:** Daily cron job to update deck metrics

## Frontend Integration Points

### Services to Update
- `src/services/StudySchedulerService.ts` - Replace mock implementations with Supabase calls
- Add Supabase client initialization

### Components Ready
- `src/components/StudyCalendar.tsx` - Calendar view with study blocks
- `src/components/StudySessionDialog.tsx` - Daily check-in interface
- `src/hooks/useStudyScheduler.tsx` - State management hook

### Type Definitions
- `src/types/study.ts` - Complete type definitions for all data structures

## Algorithm Implementation (PostgreSQL Functions)

### Core Metrics Calculation
```sql
-- Recency decay: exp(-0.05 * days_since_last_practice)
-- Accuracy: total_correct_cards / total_cards
-- Priority: (1 - accuracy) * recency_decay
-- Difficulty: normalized percentile of priority_raw
```

### Scheduling Algorithm
1. Calculate `minutes_needed = est_minutes * (1 + difficulty)`
2. Use weighted round-robin to distribute across available days
3. Prioritize decks with higher `(remaining_minutes * difficulty)`

### Rebalancing Logic
- Triggered on every user interaction
- Ranks decks using: `score = (1 / days_to_exam)^2 + 0.3 * difficulty`
- Schedules on earliest available day with capacity

## Authentication & RLS Policies
- Enable RLS on all tables
- Users can only access their own data
- Policies for INSERT, UPDATE, DELETE, SELECT operations

## Push Notifications (Future)
- OneSignal/Firebase integration
- 7PM daily reminders
- Study completion confirmations
- Overload warnings

## Next Steps
1. Connect Supabase project to Lovable
2. Create database tables with RLS policies
3. Implement Edge Functions with scheduling algorithms
4. Update frontend service layer to use Supabase
5. Test with sample user data