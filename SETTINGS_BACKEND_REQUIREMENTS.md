# Settings Backend Implementation Requirements

This document outlines the backend requirements for implementing the Settings page functionality in Tutor AI.

## Overview
The settings page requires user authentication, data persistence, subscription management, and privacy controls. All of these features require Supabase integration.

## Required Supabase Setup

### 1. Authentication
```sql
-- Enable Supabase Auth
-- This is handled automatically by Supabase, but ensure email/password auth is enabled
```

### 2. Database Tables

#### User Profiles Table
```sql
-- Extends the default auth.users table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### User Settings Table
```sql
CREATE TABLE public.user_settings (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  dark_mode BOOLEAN DEFAULT false,
  data_for_training BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = id);
```

#### Tokens and Points System
```sql
CREATE TABLE public.user_tokens (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ai_tokens INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'unlimited')),
  tokens_used_this_month INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own tokens" ON public.user_tokens
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "System can update tokens" ON public.user_tokens
  FOR UPDATE USING (true); -- This will be handled by Edge Functions
```

#### Token Usage Log
```sql
CREATE TABLE public.token_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.token_usage_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own usage log" ON public.token_usage_log
  FOR SELECT USING (auth.uid() = user_id);
```

#### Storage Usage Tracking
```sql
CREATE TABLE public.user_storage (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  files_size_bytes BIGINT DEFAULT 0,
  images_size_bytes BIGINT DEFAULT 0,
  total_files INTEGER DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 1073741824, -- 1GB default
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_storage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own storage" ON public.user_storage
  FOR SELECT USING (auth.uid() = id);
```

### 3. Edge Functions Required

#### Token Management Function
```typescript
// supabase/functions/manage-tokens/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const { action, amount } = await req.json();
  
  // Authenticate user
  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  
  const { data: { user } } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Handle token deduction/addition
  // Log usage
  // Return updated token count
});
```

#### User Data Export Function
```typescript
// supabase/functions/export-user-data/index.ts
// Function to export all user data in JSON format
// Including files, flashcards, study sessions, etc.
```

#### User Data Deletion Function
```typescript
// supabase/functions/delete-user-data/index.ts
// Function to permanently delete all user data
// Must handle cascading deletes properly
```

#### Storage Calculation Function
```typescript
// supabase/functions/calculate-storage/index.ts
// Function to calculate total storage usage
// Including uploaded files, images, etc.
```

### 4. Required Secrets
Set up the following secrets in Supabase:
- `STRIPE_SECRET_KEY` (for subscription management)
- `OPENAI_API_KEY` (for AI features)
- `ANTHROPIC_API_KEY` (alternative AI provider)

### 5. Frontend Integration Points

#### Authentication Hook
```typescript
// src/hooks/useAuth.tsx
// Hook to manage user authentication state
// Handle login, logout, profile updates
```

#### Settings Hook
```typescript
// src/hooks/useSettings.tsx
// Hook to manage user settings
// Handle theme, privacy preferences, etc.
```

#### Tokens Hook
```typescript
// src/hooks/useTokens.tsx
// Hook to manage token/points system
// Track usage, handle subscription tiers
```

## Implementation Priority

### Phase 1 - Essential Backend Setup
1. Set up Supabase Auth
2. Create user_profiles and user_settings tables
3. Implement basic profile management
4. Add dark mode persistence

### Phase 2 - Token System
1. Create token/points tables
2. Implement token management Edge Function
3. Add usage tracking
4. Create subscription tier logic

### Phase 3 - Data Management
1. Implement export functionality
2. Add storage calculation
3. Create data deletion functions
4. Add privacy controls

### Phase 4 - Subscription System
1. Integrate Stripe for payments
2. Implement subscription management
3. Add billing history
4. Handle plan upgrades/downgrades

## Security Considerations

1. **Row Level Security (RLS)**: All tables must have proper RLS policies
2. **Edge Function Security**: Use service role key only in Edge Functions
3. **Data Validation**: Validate all inputs on both frontend and backend
4. **Privacy Controls**: Respect user privacy preferences
5. **GDPR Compliance**: Implement proper data deletion and export

## Testing Requirements

1. **Unit Tests**: Test all Edge Functions
2. **Integration Tests**: Test full user flows
3. **Security Tests**: Verify RLS policies work correctly
4. **Performance Tests**: Ensure token system scales

## Future Enhancements

1. **Analytics Dashboard**: Track app usage patterns
2. **Advanced Subscription Features**: Team plans, enterprise features
3. **Data Backup**: Automated backups for premium users
4. **API Rate Limiting**: Prevent abuse of AI features