# Study Scheduler Backend Specification (Provider-agnostic)

This document describes the API and data model needed to fully enable the dynamic scheduling experience in a backend-agnostic way (can be implemented with Supabase, Firebase, custom Node, etc.).

## Core Entities
- User
- StudyFile (course/notebook)
- StudyDeck (subtopic deck within a file)
- Assessment (quiz/exam/assignment)
- DailyPlan (schedule for a specific day)
- PracticeLog (per study session stats)
- DeckMetrics (computed performance metrics)
- Preferences (per-user scheduler preferences)

## API Endpoints

- GET /files -> StudyFile[]
- POST /files { name, color_hex } -> StudyFile
- GET /files/:id/decks -> StudyDeck[]
- POST /files/:id/decks { name, est_minutes } -> StudyDeck

- GET /assessments -> Assessment[]
- POST /assessments { name, date, file_ids, weight, deck_weights?, daily_minutes? } -> Assessment
- PATCH /assessments/:id { ...partial } -> Assessment
- DELETE /assessments/:id -> 204

- GET /study-plan?start=YYYY-MM-DD&end=YYYY-MM-DD -> StudyPlanResponse
- POST /generate-study-plan { assessment_id } -> 202 (async generation)

- POST /mark-study-session { date: YYYY-MM-DD, deck_id, actual_minutes, correct_cards, total_cards } -> 200
- POST /reschedule-session { date: YYYY-MM-DD, deck_id, reason } -> 200

- GET /deck-metrics -> DeckMetrics[]
- GET /practice-log?start&end -> PracticeLog[]

- GET /preferences -> { daily_minutes, equal_weighting }
- PUT /preferences { daily_minutes, equal_weighting } -> 200

## Scheduling Algorithm (high-level)

1. Inputs
   - Upcoming assessments (name, date, weight, selected files/decks)
   - User preferences: daily_minutes budget, equal_weighting or custom deck_weights
   - DeckMetrics: accuracy, recency_decay, difficulty (derived from PracticeLog)
   - FSRS readiness/confidence targets per deck (goal target_accuracy)

2. Per-day Allocation
   - Determine number of available days between today and assessment date
   - Compute per-deck priority: f(difficulty, 1-accuracy, recency_decay, deck_weight)
   - Distribute daily_minutes across decks using weighted round-robin by priority
   - Produce CalendarDay with blocks: { deck_id, deck_name, minutes, goals: { target_accuracy } }

3. Rebalancing (Daily Check-in)
   - When a session is marked studied/skipped, append PracticeLog
   - Recompute DeckMetrics and priorities
   - Reallocate remaining days to keep user on track for targets

## Data Contracts

Refer to src/types/study.ts for the exact TypeScript interfaces used by the frontend.

## Auth and Multi-tenancy
- All endpoints must be authenticated and scoped to the current user.
- Use RLS or route-level access control to enforce row ownership.

## Performance & Observability
- Paginate heavy lists (practice logs)
- Cache read-most endpoints (files, metrics) with short TTL
- Log plan generations and rebalancing events for debugging

## Webhooks/Workers (optional)
- Nightly metric recalculation
- Reminder notifications for upcoming assessments or missed days

## Notes
- The frontend currently uses mock data via StudySchedulerService. Implement these endpoints and swap the service methods to call them.
