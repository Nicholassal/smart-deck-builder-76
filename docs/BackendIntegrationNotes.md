# Backend Integration Notes (Platform-Agnostic)

This document outlines the data model, API contracts, and workflows needed to power key features in this app. It is platform-agnostic and can be implemented with any backend stack (Supabase, Firebase, custom Node, Rails, etc.).

Use this as implementation guidance for a future backend engineer.


## 1) Authentication and Users
- Minimal requirement: uniquely identify a user (user_id) for all persisted resources.
- Recommended: email+password auth with sessions; optionally OAuth.
- All endpoints must be scoped by authenticated user_id.


## 2) Core Entities and Relationships
- User (1) — (N) StudyFile
- StudyFile (1) — (N) Deck
- Deck (1) — (N) Section
- Section (1) — (N) Flashcard
- Exam/Assessment associated to one or more Decks
- StudySession entries log user study actions per day/deck/flashcard

Suggested identifiers: UUID v4 strings for all ids.


## 3) Data Models (suggested fields)

User
- id, email, created_at

StudyFile
- id, user_id, name, color_hex, semester, year, parent_file_id, created_at

Deck
- id, file_id, name, course_name, created_at

Section
- id, deck_id, name, week, created_at

Flashcard
- id, section_id, type: 'text' | 'image' | 'equation'
- question, answer, difficulty: 'easy' | 'medium' | 'hard'
- image_url (nullable)
- masks JSON array [{ id, x, y, width, height, color, isVisible }]
- fsrs_state JSON (all fields required by FSRS impl)
- created_at, updated_at

Exam (Assessment)
- id, user_id, name, date (UTC), time (optional string), location (string?), duration_minutes (int?)
- deck_ids: string[] (or normalize via join table ExamDecks)
- color_hex
- study_plan JSON array of StudyPlan items (optional if plan generated server-side)
- created_at

StudyPlan item (for each day/deck)
- date (UTC date only)
- deck_id
- section_ids: string[] (subset of deck sections)
- target_minutes (estimated_minutes)
- actual_minutes (nullable)
- status: 'pending' | 'studied' | 'skipped'
- goals (optional): { target_accuracy?: number }

StudySession (Practice Log)
- id, user_id, flashcard_id, response ('again'|'hard'|'good'|'easy'), is_correct (bool)
- response_time_ms (int), created_at

DailyCheck (optional explicit record of daily check-in)
- id, user_id, date, notes, auto_adjustments JSON


## 4) API Contracts (REST examples)

Auth (example only)
- POST /auth/login { email, password } -> { token }
- GET /auth/me -> { user }

Files/Decks/Sections
- GET /files -> StudyFile[]
- POST /files { name, semester?, year?, parent_file_id? } -> StudyFile
- PATCH /files/:id -> StudyFile
- DELETE /files/:id -> { ok: true }

- POST /decks { file_id, name, course_name? } -> Deck
- PATCH /decks/:id -> Deck
- DELETE /decks/:id -> { ok: true }

- POST /sections { deck_id, name, week? } -> Section
- PATCH /sections/:id -> Section
- DELETE /sections/:id -> { ok: true }

Flashcards
- GET /sections/:id/flashcards -> Flashcard[]
- POST /flashcards { section_id, type, question, answer, difficulty, image_url?, masks? } -> Flashcard
- PATCH /flashcards/:id { question?, answer?, image_url?, masks? } -> Flashcard
- DELETE /flashcards/:id -> { ok: true }

Exams/Assessments
- GET /exams -> Exam[]
- POST /exams { name, date, deck_ids[], time?, location?, duration_minutes? } -> Exam
- PATCH /exams/:id -> Exam
- DELETE /exams/:id -> { ok: true }

Study Plan
- POST /exams/:id/plan/generate { preferences } -> { plan: StudyPlan[] }
- GET /exams/:id/plan -> StudyPlan[]
- PATCH /exams/:id/plan { items: StudyPlan[] } -> StudyPlan[]
- POST /plan/day/mark { date, deck_id, status, actual_minutes? } -> { ok: true }

Stats/Practice
- POST /practice { flashcard_id, response, is_correct, response_time_ms } -> { ok: true }
- GET /stats/overview -> { totals, accuracy, streak, weekly }
- GET /decks/:id/performance -> { averageAccuracy, recentSessions, difficulty }


## 5) Workflows

A) Plan Generation (Exam -> Study Plan)
1. Input: user_id, exam_id, preferences
   - preferences.daily_minutes (int)
   - preferences.weighting: 'equal' | 'custom'
   - preferences.topic_weights: Record<deck_id|section_id, number> (sum = 100 for custom)
   - preferences.target_accuracy (e.g., 0.85)
2. Gather data:
   - Decks and sections under exam.deck_ids
   - FSRS-derived performance per deck/section (accuracy, difficulty)
   - Available days: today..exam.date-1
3. Allocation logic:
   - Compute total weighted content load:
     weight_i = customWeight_i or equal (1/N)
     difficulty_factor_i = f(1 - accuracy_i) (e.g., 0.5..1.5 scaling)
     load_i = baseUnits_i * weight_i * difficulty_factor_i
   - Distribute load across days constrained by daily_minutes
   - Create StudyPlan items with target_minutes per day and section_ids assigned
   - Persist plan
4. Return StudyPlan[] and echo preferences used (for audit)

B) Daily Check-in
- Input: date, deck_id, actual_minutes, status ('studied'|'skipped')
- Update plan item
- Optionally recompute remaining allocation to keep on track (push missed content forward)
- Log a DailyCheck record with adjustments

C) FSRS Integration
- On each practice POST /practice, update card.fsrs_state and append StudySession
- Periodically aggregate to deck/section performance for plan generation

D) Image Flashcards & Masks
- Upload image to storage -> return public URL
- Persist masks JSON on Flashcard
- Optionally generate masked variants server-side for performance (pre-rendered PNGs)


## 6) Preferences (Client provides; server consumes)
- daily_minutes: number (derived from hours+minutes UI)
- weighting: 'equal' | 'custom'
- topic_weights: map(deck_id|section_id -> 0..100), validate sum=100 when custom
- target_accuracy: float 0..1 (default 0.85)
- allow_rebalance: boolean (auto-move missed work)


## 7) Security & Validation
- Validate ownership (user_id matches resource owner) for all CRUD
- Body validation with JSON schema (zod/yup/ajv)
- Rate limit write-heavy endpoints (/practice, /plan/day/mark)


## 8) Performance Considerations
- Paginate flashcards
- Cache deck/section performance aggregates
- Use background jobs to regenerate plans after many updates


## 9) Migration Strategy
- Start with Exams, Decks, Sections, Flashcards tables
- Add StudyPlan and StudySession
- Add preferences storage (per-exam and/or global defaults)


## 10) Example Plan Generation Pseudocode
```
function generatePlan({ exam, decks, sectionsByDeck, perfByDeck, preferences }) {
  const days = eachDay(today, exam.date - 1);
  const minutesPerDay = preferences.daily_minutes;
  const weights = computeWeights(decks, sectionsByDeck, perfByDeck, preferences);

  const plan = [];
  for (const day of days) {
    let remaining = minutesPerDay;
    while (remaining > 0) {
      const next = pickNextChunk(weights); // chooses deck/section by remaining weighted load
      if (!next) break;
      const minutes = Math.min(remaining, estimateMinutes(next));
      plan.push({ date: day, deck_id: next.deck_id, section_ids: next.sections, target_minutes: minutes, status: 'pending' });
      remaining -= minutes;
    }
  }
  return plan;
}
```


## 11) File Storage
- Any blob (images, PDFs) should be uploaded via signed URL flow
- Store only public URL + metadata on Flashcard


## 12) Observability
- Log plan generation runs with inputs/outputs for debugging
- Store version of algorithm used for reproducibility


## 13) Minimal DB Schema (DDL-like outline)
- Provided on request; follow models in section 3. Normalize ExamDecks if preferred.


Notes
- The current frontend includes a local mock of plan generation; backend should replace it with the above allocation logic and persist results via the API described here.
