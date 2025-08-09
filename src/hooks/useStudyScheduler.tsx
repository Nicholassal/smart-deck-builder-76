import { useState, useEffect, useCallback } from 'react';
import { 
  StudySchedulerState, 
  StudyFile, 
  Assessment, 
  StudyPlanResponse,
  CreateAssessmentForm,
  StudySessionForm,
  UIStudyBlock
} from '@/types/study';
import { studySchedulerService } from '@/services/StudySchedulerService';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, format as formatDate } from 'date-fns';

const initialState: StudySchedulerState = {
  files: [],
  decks: [],
  assessments: [],
  dailyPlans: [],
  practiceLog: [],
  deckMetrics: [],
  selectedDate: null,
  currentMonth: new Date(),
  isLoading: false,
  error: null,
  plan: null
};

export const useStudyScheduler = () => {
  const [state, setState] = useState<StudySchedulerState>(initialState);
  const { toast } = useToast();
  
  // TODO: Replace with actual user authentication
  const userId = 'user1'; // This will come from Supabase auth

  // ==================== DATA LOADING ====================
  const loadFiles = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const files = await studySchedulerService.getFiles(userId);
      setState(prev => ({ ...prev, files, isLoading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to load files', isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load study files",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  const loadAssessments = useCallback(async () => {
    try {
      const assessments = await studySchedulerService.getAssessments(userId);
      setState(prev => ({ ...prev, assessments }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to load assessments' }));
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  const loadStudyPlan = useCallback(async (startDate: string, endDate: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const planResponse = await studySchedulerService.getStudyPlan(userId, startDate, endDate);
      
// Update state with plan data
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        plan: planResponse,
        // Load files and decks from plan response
        files: planResponse.days.flatMap(day => 
          day.blocks.map(block => ({
            file_id: block.deck_id.split('-')[0] || 'unknown', // Temporary file ID derivation
            name: block.file_name,
            color_hex: block.color,
            created_at: new Date(),
            user_id: userId
          }))
        ).filter((file, index, self) => 
          self.findIndex(f => f.file_id === file.file_id) === index
        ),
        decks: planResponse.days.flatMap(day => 
          day.blocks.map(block => ({
            deck_id: block.deck_id,
            file_id: block.deck_id.split('-')[0] || 'unknown', // Temporary file ID derivation
            name: block.deck_name,
            est_minutes: block.minutes,
            created_at: new Date()
          }))
        ).filter((deck, index, self) => 
          self.findIndex(d => d.deck_id === deck.deck_id) === index
        ),
        // Convert plan response to daily plans
        dailyPlans: planResponse.days.flatMap(day => 
          day.blocks.map(block => ({
            date: new Date(day.date),
            deck_id: block.deck_id,
            target_minutes: block.minutes,
            actual_minutes: null,
            status: block.status,
            user_id: userId
          }))
        )
      }));
      
      return planResponse;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to load study plan', isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load study plan",
        variant: "destructive"
      });
      return null;
    }
  }, [userId, toast]);

  // ==================== ASSESSMENT MANAGEMENT ====================
  const createAssessment = useCallback(async (form: CreateAssessmentForm) => {
    try {
      const assessment = await studySchedulerService.createAssessment(form, userId);
      setState(prev => ({ 
        ...prev, 
        assessments: [...prev.assessments, assessment] 
      }));
      
      // Reload current month's study plan so blocks appear immediately
      const start = formatDate(startOfMonth(state.currentMonth), 'yyyy-MM-dd');
      const end = formatDate(endOfMonth(state.currentMonth), 'yyyy-MM-dd');
      await loadStudyPlan(start, end);
      
      toast({
        title: "Success",
        description: "Assessment created and study plan generated",
      });
      
      return assessment;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive"
      });
      throw error;
    }
  }, [userId, toast, state.currentMonth, loadStudyPlan]);

  const deleteAssessment = useCallback(async (assessmentId: string) => {
    try {
      await studySchedulerService.deleteAssessment(assessmentId);
      setState(prev => ({ 
        ...prev, 
        assessments: prev.assessments.filter(a => a.assessment_id !== assessmentId) 
      }));
      
      toast({
        title: "Success",
        description: "Assessment deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive"
      });
    }
  }, [toast]);

  // ==================== DAILY STUDY INTERACTIONS ====================
  const markDayStudied = useCallback(async (date: string, deckId: string, session: StudySessionForm) => {
    try {
      await studySchedulerService.markDayStudied(date, deckId, session, userId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        dailyPlans: prev.dailyPlans.map(plan => 
          plan.date.toISOString().split('T')[0] === date && plan.deck_id === deckId
            ? { ...plan, status: 'studied' as const, actual_minutes: session.actual_minutes }
            : plan
        )
      }));

toast({
        title: "Great job!",
        description: `Marked ${session.actual_minutes} minutes of study complete`,
      });

      // Simulate rebalancing by reloading current month's plan
      const start = formatDate(startOfMonth(state.currentMonth), 'yyyy-MM-dd');
      const end = formatDate(endOfMonth(state.currentMonth), 'yyyy-MM-dd');
      await loadStudyPlan(start, end);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record study session",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  const markDaySkipped = useCallback(async (date: string, deckId: string) => {
    try {
      await studySchedulerService.markDaySkipped(date, deckId, userId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        dailyPlans: prev.dailyPlans.map(plan => 
          plan.date.toISOString().split('T')[0] === date && plan.deck_id === deckId
            ? { ...plan, status: 'skipped' as const }
            : plan
        )
      }));

toast({
        title: "Session rescheduled",
        description: "Your study session has been moved to another day",
      });

      // Simulate rebalancing by reloading current month's plan
      const start = formatDate(startOfMonth(state.currentMonth), 'yyyy-MM-dd');
      const end = formatDate(endOfMonth(state.currentMonth), 'yyyy-MM-dd');
      await loadStudyPlan(start, end);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule session",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  // ==================== UI STATE MANAGEMENT ====================
  const setSelectedDate = useCallback((date: Date | null) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  const setCurrentMonth = useCallback((month: Date) => {
    setState(prev => ({ ...prev, currentMonth: month }));
  }, []);

  // ==================== COMPUTED VALUES ====================
const getStudyBlocksForDate = useCallback((date: Date): UIStudyBlock[] => {
    const dateStr = date.toISOString().split('T')[0];
    const day = state.plan?.days.find(d => d.date === dateStr);

    if (!day) {
      // fallback to dailyPlans mapping
      const plans = state.dailyPlans.filter(plan => plan.date.toISOString().split('T')[0] === dateStr);
      return plans.map(plan => {
        const deck = state.decks.find(d => d.deck_id === plan.deck_id);
        const file = state.files.find(f => f.file_id === deck?.file_id);
        return {
          deck_id: plan.deck_id,
          deck_name: deck?.name || 'Unknown Deck',
          minutes: plan.target_minutes,
          target_minutes: plan.target_minutes,
          actual_minutes: plan.actual_minutes,
          color: file?.color_hex || '#6B7280',
          status: plan.status,
          file_name: file?.name || 'Unknown File',
          goals: undefined
        } as UIStudyBlock;
      });
    }

    // Enrich with target_minutes/actual_minutes if present in dailyPlans
    const planMap = new Map(
      state.dailyPlans
        .filter(p => p.date.toISOString().split('T')[0] === dateStr)
        .map(p => [p.deck_id, p])
    );

    return day.blocks.map(block => ({
      ...block,
      target_minutes: planMap.get(block.deck_id)?.target_minutes ?? block.minutes,
      actual_minutes: planMap.get(block.deck_id)?.actual_minutes ?? null
    }));
  }, [state.plan, state.dailyPlans, state.decks, state.files]);

  const getUpcomingAssessments = useCallback(() => {
    const now = new Date();
    return state.assessments
      .filter(assessment => assessment.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Next 5 assessments
  }, [state.assessments]);

  const getTotalStudyMinutesForWeek = useCallback((weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return state.dailyPlans
      .filter(plan => {
        const planDate = plan.date;
        return planDate >= weekStart && planDate < weekEnd;
      })
      .reduce((total, plan) => total + plan.target_minutes, 0);
  }, [state.dailyPlans]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    loadFiles();
    loadAssessments();
  }, [loadFiles, loadAssessments]);

  return {
    // State
    ...state,
    
    // Data loading
    loadFiles,
    loadAssessments,
    loadStudyPlan,
    
    // Assessment management
    createAssessment,
    deleteAssessment,
    
    // Daily interactions
    markDayStudied,
    markDaySkipped,
    
    // UI state
    setSelectedDate,
    setCurrentMonth,
    
    // Computed values
    getStudyBlocksForDate,
    getUpcomingAssessments,
    getTotalStudyMinutesForWeek,
    
    // Current user (for development)
    userId
  };
};