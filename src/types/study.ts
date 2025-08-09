export interface StudyFile {
  file_id: string;
  name: string;
  color_hex: string;
  created_at: Date;
  user_id: string;
}

export interface StudyDeck {
  deck_id: string;
  file_id: string;
  name: string;
  est_minutes: number; // user-estimated time to review this deck
  created_at: Date;
}

export interface Assessment {
  assessment_id: string;
  file_id: string;
  name: string;
  date: Date;
  weight: number; // default = 1
  created_at: Date;
  user_id: string;
  // Optional: per-deck weighting and daily budget for scheduling
  deck_weights?: DeckWeight[];
  daily_minutes?: number;
}

export interface PracticeLog {
  log_id: string;
  deck_id: string;
  timestamp: Date;
  correct_cards: number;
  total_cards: number;
  user_id: string;
}

export interface DailyPlan {
  date: Date;
  deck_id: string;
  target_minutes: number;
  actual_minutes: number | null;
  status: 'pending' | 'studied' | 'skipped';
  user_id: string;
}

// Computed metrics (calculated by backend)
export interface DeckMetrics {
  deck_id: string;
  recency_decay: number; // exp(-λ * days_since_last_practice)
  accuracy: number; // total_correct_cards / total_cards
  volume_score: number; // sum of total_cards over all sessions
  priority_raw: number; // (1 - accuracy) * recency_decay
  difficulty: number; // normalized percentile of priority_raw
  last_calculated: Date;
}

// API Response types
export interface DeckWeight {
  deck_id: string;
  weight: number; // relative weight within an assessment
}

export interface StudyGoal {
  target_accuracy: number; // e.g., 0.8 = 80%
  target_minutes: number;
  target_cards?: number;
}

export interface StudyBlock {
  deck_id: string;
  deck_name: string;
  minutes: number;
  color: string; // pulled from parent file
  status: 'pending' | 'studied' | 'skipped';
  file_name: string;
  goals?: StudyGoal; // optional per-block goal guidance
}

export interface UIStudyBlock extends StudyBlock {
  target_minutes: number;
  actual_minutes: number | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD format
  blocks: StudyBlock[];
  exam_marker: boolean;
  total_minutes: number;
  completion_percentage: number;
}

export interface StudyPlanResponse {
  days: CalendarDay[];
  stats: {
    total_study_days: number;
    completed_days: number;
    upcoming_assessments: Assessment[];
    average_daily_minutes: number;
  };
}

// Frontend state management types
export interface StudySchedulerState {
  files: StudyFile[];
  decks: StudyDeck[];
  assessments: Assessment[];
  dailyPlans: DailyPlan[];
  practiceLog: PracticeLog[];
  deckMetrics: DeckMetrics[];
  selectedDate: Date | null;
  currentMonth: Date;
  isLoading: boolean;
  error: string | null;
  plan?: StudyPlanResponse | null;
}

// Form types for UI
export interface CreateAssessmentForm {
  name: string;
  date: Date;
  file_ids: string[];
  weight: number;
  deck_weights?: DeckWeight[]; // optional per-deck weights
  daily_minutes?: number; // optional daily study budget
}

export interface StudySessionForm {
  deck_id: string;
  actual_minutes: number;
  correct_cards: number;
  total_cards: number;
}

export interface RescheduleRequest {
  date: Date;
  deck_id: string;
  reason: 'skipped' | 'partial_completion';
}