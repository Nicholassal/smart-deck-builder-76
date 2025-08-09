import { 
  StudyFile, 
  StudyDeck, 
  Assessment, 
  DailyPlan, 
  PracticeLog, 
  StudyPlanResponse,
  CreateAssessmentForm,
  StudySessionForm,
  RescheduleRequest,
  CalendarDay
} from '@/types/study';

// This service will interface with Supabase once integrated
// Currently contains mock implementations for development

export class StudySchedulerService {
  private baseUrl = '/api/study'; // Will be Supabase functions endpoint

  // ==================== FILES ====================
  async getFiles(userId: string): Promise<StudyFile[]> {
    // TODO: Replace with Supabase query
    // SELECT * FROM files WHERE user_id = userId
    return this.mockFiles;
  }

  async createFile(name: string, colorHex: string, userId: string): Promise<StudyFile> {
    // TODO: Replace with Supabase insert
    // INSERT INTO files (name, color_hex, user_id) VALUES (...)
    const newFile: StudyFile = {
      file_id: crypto.randomUUID(),
      name,
      color_hex: colorHex,
      created_at: new Date(),
      user_id: userId
    };
    return newFile;
  }

  // ==================== DECKS ====================
  async getDecks(fileId: string): Promise<StudyDeck[]> {
    // TODO: Replace with Supabase query
    // SELECT * FROM decks WHERE file_id = fileId
    return this.mockDecks.filter(deck => deck.file_id === fileId);
  }

  async createDeck(fileId: string, name: string, estMinutes: number): Promise<StudyDeck> {
    // TODO: Replace with Supabase insert
    // INSERT INTO decks (file_id, name, est_minutes) VALUES (...)
    const newDeck: StudyDeck = {
      deck_id: crypto.randomUUID(),
      file_id: fileId,
      name,
      est_minutes: estMinutes,
      created_at: new Date()
    };
    return newDeck;
  }

  // ==================== ASSESSMENTS ====================
  async getAssessments(userId: string): Promise<Assessment[]> {
    // TODO: Replace with Supabase query
    // SELECT * FROM assessments WHERE user_id = userId ORDER BY date ASC
    return this.mockAssessments;
  }

  async createAssessment(form: CreateAssessmentForm, userId: string): Promise<Assessment> {
    // TODO: Replace with Supabase insert + trigger study plan generation
    // 1. INSERT INTO assessments (...)
    // 2. Call generate_study_plan() function
    const newAssessment: Assessment = {
      assessment_id: crypto.randomUUID(),
      file_id: form.file_ids[0], // For now, assume one file per assessment
      name: form.name,
      date: form.date,
      weight: form.weight,
      created_at: new Date(),
      user_id: userId,
      deck_weights: form.deck_weights,
      daily_minutes: form.daily_minutes
    };
    
    // Save to mock store for now
    this.mockAssessments.push(newAssessment);
    
    // Trigger study plan generation
    await this.generateStudyPlan(newAssessment.assessment_id);
    
    return newAssessment;
  }

  async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<Assessment> {
    // TODO: Replace with Supabase update + regenerate study plan
    // 1. UPDATE assessments SET ... WHERE assessment_id = assessmentId
    // 2. DELETE FROM daily_plan WHERE deck_id IN (SELECT deck_id FROM decks WHERE file_id = assessment.file_id)
    // 3. Call generate_study_plan() function
    throw new Error('Not implemented');
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    // TODO: Replace with Supabase delete + cleanup daily plans
    // 1. DELETE FROM daily_plan WHERE deck_id IN (related decks)
    // 2. DELETE FROM assessments WHERE assessment_id = assessmentId
    throw new Error('Not implemented');
  }

  // ==================== STUDY PLANNING ====================
  async getStudyPlan(userId: string, startDate: string, endDate: string): Promise<StudyPlanResponse> {
    // TODO: Replace with Supabase function call
    // SELECT * FROM get_study_plan(userId, startDate, endDate)
    return this.generateMockStudyPlan(startDate, endDate);
  }

  async generateStudyPlan(assessmentId: string): Promise<void> {
    // TODO: Replace with Supabase function call
    // This will be a PostgreSQL function that implements the scheduling algorithm
    // CALL generate_study_plan(assessmentId)
    console.log(`Generating study plan for assessment: ${assessmentId}`);
  }

  // ==================== DAILY INTERACTIONS ====================
  async markDayStudied(date: string, deckId: string, session: StudySessionForm, userId: string): Promise<void> {
    // TODO: Replace with Supabase transaction
    // 1. UPDATE daily_plan SET status = 'studied', actual_minutes = session.actual_minutes WHERE date = date AND deck_id = deckId
    // 2. INSERT INTO practice_log (deck_id, timestamp, correct_cards, total_cards, user_id) VALUES (...)
    // 3. CALL rebalance_study_plan(userId)
    console.log('Marking day as studied:', { date, deckId, session });
  }

  async markDaySkipped(date: string, deckId: string, userId: string): Promise<void> {
    // TODO: Replace with Supabase transaction
    // 1. UPDATE daily_plan SET status = 'skipped' WHERE date = date AND deck_id = deckId
    // 2. CALL reschedule_skipped_session(deckId, date, userId)
    console.log('Marking day as skipped:', { date, deckId });
  }

  async rescheduleSession(request: RescheduleRequest, userId: string): Promise<CalendarDay[]> {
    // TODO: Replace with Supabase function call
    // CALL reschedule_session(request.deck_id, request.date, request.reason, userId)
    // Returns updated calendar days
    return [];
  }

  // ==================== ANALYTICS ====================
  async getStudyAnalytics(userId: string, startDate: string, endDate: string): Promise<any> {
    // TODO: Replace with Supabase analytics query
    // Complex query to get completion rates, accuracy trends, etc.
    return {
      completion_rate: 0.85,
      average_accuracy: 0.78,
      total_study_minutes: 1240,
      streak_days: 12
    };
  }

  // ==================== NOTIFICATIONS ====================
  async scheduleReminder(userId: string, date: string, time: string): Promise<void> {
    // TODO: Implement with Supabase Edge Functions + OneSignal/Firebase
    // This will schedule push notifications for study reminders
    console.log('Scheduling reminder:', { userId, date, time });
  }

  async sendStudyReminder(userId: string): Promise<void> {
    // TODO: Edge function to send push notification
    console.log('Sending study reminder to:', userId);
  }

  // ==================== MOCK DATA (Remove after Supabase integration) ====================
  private mockFiles: StudyFile[] = [
    {
      file_id: '1',
      name: 'Calculus I',
      color_hex: '#3B82F6',
      created_at: new Date('2024-01-15'),
      user_id: 'user1'
    },
    {
      file_id: '2',
      name: 'Chemistry',
      color_hex: '#10B981',
      created_at: new Date('2024-01-20'),
      user_id: 'user1'
    }
  ];

  private mockDecks: StudyDeck[] = [
    {
      deck_id: 'd1',
      file_id: '1',
      name: 'Derivatives',
      est_minutes: 45,
      created_at: new Date('2024-01-16')
    },
    {
      deck_id: 'd2',
      file_id: '1',
      name: 'Integrals',
      est_minutes: 60,
      created_at: new Date('2024-01-18')
    },
    {
      deck_id: 'd3',
      file_id: '2',
      name: 'Organic Compounds',
      est_minutes: 50,
      created_at: new Date('2024-01-21')
    }
  ];

  private mockAssessments: Assessment[] = [
    {
      assessment_id: 'a1',
      file_id: '1',
      name: 'Midterm Exam',
      date: new Date('2024-03-15'),
      weight: 2,
      created_at: new Date('2024-01-25'),
      user_id: 'user1'
    }
  ];

  private generateMockStudyPlan(startDate: string, endDate: string): StudyPlanResponse {
    const days: CalendarDay[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the nearest upcoming assessment within or after the range
    const upcoming = this.mockAssessments
      .filter(a => a.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d);
      current.setHours(0, 0, 0, 0);
      const dateStr = current.toISOString().split('T')[0];

      let blocks: CalendarDay['blocks'] = [];
      let totalMinutes = 0;
      let exam_marker = false;

      if (upcoming) {
        const examDateStr = upcoming.date.toISOString().split('T')[0];
        exam_marker = dateStr === examDateStr;

        // Only schedule from today until the day before the exam
        if (current >= today && current < new Date(examDateStr)) {
          const file = this.mockFiles.find(f => f.file_id === upcoming.file_id);
          const fileDecks = this.mockDecks.filter(dk => dk.file_id === upcoming.file_id);
          let includedDecks = fileDecks.map(d => d.deck_id);
          let weights: Record<string, number> = {};

          if (upcoming.deck_weights && upcoming.deck_weights.length > 0) {
            includedDecks = upcoming.deck_weights.map(dw => dw.deck_id);
            upcoming.deck_weights.forEach(dw => (weights[dw.deck_id] = dw.weight));
          } else {
            // Equal weighting by default (percentages)
            const base = Math.floor(100 / includedDecks.length);
            const remainder = 100 - base * includedDecks.length;
            includedDecks.forEach((id, idx) => (weights[id] = base + (idx < remainder ? 1 : 0)));
          }

          const sumWeights = includedDecks.reduce((s, id) => s + (weights[id] || 0), 0) || 1;
          const budget = Math.max(30, upcoming.daily_minutes ?? 90);

          blocks = includedDecks.map(deck_id => {
            const deck = fileDecks.find(dk => dk.deck_id === deck_id)!;
            const minutes = Math.max(10, Math.round((budget * (weights[deck_id] || 0)) / sumWeights));
            totalMinutes += minutes;
            return {
              deck_id,
              deck_name: deck.name,
              minutes,
              color: file?.color_hex || '#6B7280',
              status: 'pending' as const,
              file_name: file?.name || 'Unknown File',
              goals: { target_accuracy: 0.8, target_minutes: minutes }
            };
          });
        }
      }

      days.push({
        date: dateStr,
        blocks,
        exam_marker,
        total_minutes: totalMinutes,
        completion_percentage: 0
      });
    }

    return {
      days,
      stats: {
        total_study_days: days.filter(d => d.blocks.length > 0).length,
        completed_days: 0,
        upcoming_assessments: this.mockAssessments,
        average_daily_minutes: Math.round(
          (days.reduce((s, d) => s + d.total_minutes, 0) / Math.max(1, days.length))
        )
      }
    };
  }
}

export const studySchedulerService = new StudySchedulerService();