import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FirstVisitGuide } from '@/components/FirstVisitGuide';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendingUp, Brain, Clock, Target, Calendar, BookOpen, ChevronDown, ChevronRight, BarChart3, Users, Play, AlertTriangle, CheckCircle2, Timer, Zap, Award, TrendingDown } from 'lucide-react';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { useDataStore } from '@/hooks/useDataStore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FSRSStudyMode } from '@/components/FSRSStudyMode';
import { fsrsScheduler } from '@/lib/fsrs';
import { Flashcard } from '@/types/flashcard';

export function StatsView() {
  const { getStudyStats, getDueCards, files, sessions } = useDataStore();
  const stats = getStudyStats();
  const dueCards = getDueCards();
  const dailyTarget = 30; // Default daily target
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [showStudyMode, setShowStudyMode] = useState(false);
  
  // Calculate detailed course statistics with FSRS data
  const courseStats = files.map(file => {
    const allCards = file.decks.flatMap(deck => 
      deck.sections.flatMap(section => section.flashcards)
    );
    const fileSessions = sessions.filter(session => 
      allCards.some(card => card.id === session.flashcardId)
    );
    const correctSessions = fileSessions.filter(s => s.isCorrect);
    const accuracy = fileSessions.length > 0 ? Math.round((correctSessions.length / fileSessions.length) * 100) : 0;
    
    // FSRS-specific analysis
    const now = new Date();
    const fsrsAnalysis = {
      // Card states
      newCards: allCards.filter(card => card.fsrsData.state === 0),
      learningCards: allCards.filter(card => card.fsrsData.state === 1),
      reviewCards: allCards.filter(card => card.fsrsData.state === 2),
      relearningCards: allCards.filter(card => card.fsrsData.state === 3),
      
      // Due status
      overdueCards: allCards.filter(card => new Date(card.fsrsData.nextReview) < now && card.fsrsData.state !== 0),
      dueToday: allCards.filter(card => {
        const nextReview = new Date(card.fsrsData.nextReview);
        const today = new Date();
        return nextReview.toDateString() === today.toDateString();
      }),
      
      // Difficulty distribution
      easyCards: allCards.filter(card => card.fsrsData.difficulty <= 3),
      mediumCards: allCards.filter(card => card.fsrsData.difficulty > 3 && card.fsrsData.difficulty <= 7),
      hardCards: allCards.filter(card => card.fsrsData.difficulty > 7),
      
      // Retention analysis
      highRetention: allCards.filter(card => {
        const recall = card.fsrsData.lastReview ? fsrsScheduler.getRecallProbability(card.fsrsData) : 1;
        return recall >= 0.9;
      }),
      mediumRetention: allCards.filter(card => {
        const recall = card.fsrsData.lastReview ? fsrsScheduler.getRecallProbability(card.fsrsData) : 1;
        return recall >= 0.7 && recall < 0.9;
      }),
      lowRetention: allCards.filter(card => {
        const recall = card.fsrsData.lastReview ? fsrsScheduler.getRecallProbability(card.fsrsData) : 1;
        return recall < 0.7;
      }),
      
      // Review frequency
      averageInterval: allCards.length > 0 ? 
        allCards.reduce((sum, card) => sum + card.fsrsData.scheduledDays, 0) / allCards.length : 0,
      averageStability: allCards.length > 0 ?
        allCards.reduce((sum, card) => sum + card.fsrsData.stability, 0) / allCards.length : 0,
      totalReviews: allCards.reduce((sum, card) => sum + card.fsrsData.reps, 0),
      
      // Urgent cards (overdue + low retention)
      urgentCards: allCards.filter(card => {
        const isOverdue = new Date(card.fsrsData.nextReview) < now && card.fsrsData.state !== 0;
        const recall = card.fsrsData.lastReview ? fsrsScheduler.getRecallProbability(card.fsrsData) : 1;
        return isOverdue || recall < 0.6;
      })
    };
    
    // Calculate deck-wise performance with FSRS data
    const deckPerformance = file.decks.map(deck => {
      const deckCards = deck.sections.flatMap(section => section.flashcards);
      const deckSessions = sessions.filter(session => 
        deckCards.some(card => card.id === session.flashcardId)
      );
      const deckCorrect = deckSessions.filter(s => s.isCorrect);
      const deckAccuracy = deckSessions.length > 0 ? Math.round((deckCorrect.length / deckSessions.length) * 100) : 0;
      
      // FSRS deck analysis
      const deckDue = deckCards.filter(card => new Date(card.fsrsData.nextReview) <= now);
      const deckMature = deckCards.filter(card => card.fsrsData.reps >= 4);
      const deckAvgDifficulty = deckCards.length > 0 ?
        deckCards.reduce((sum, card) => sum + card.fsrsData.difficulty, 0) / deckCards.length : 0;
      
      return {
        name: deck.name,
        accuracy: deckAccuracy,
        totalCards: deckCards.length,
        studiedCards: deckSessions.length,
        correctCards: deckCorrect.length,
        dueCards: deckDue.length,
        matureCards: deckMature.length,
        avgDifficulty: deckAvgDifficulty
      };
    });

    // Calculate recent activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const daySessions = fileSessions.filter(session => 
        session.timestamp >= dayStart && session.timestamp <= dayEnd
      );
      return daySessions.length;
    });

    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (accuracy >= 85) confidence = 'high';
    else if (accuracy < 70) confidence = 'low';
    
    return {
      id: file.id,
      name: file.name,
      color: file.color,
      accuracy,
      totalCards: allCards.length,
      studiedCards: fileSessions.length,
      correctCards: correctSessions.length,
      confidence,
      deckPerformance,
      weeklyActivity,
      decksCount: file.decks.length,
      fsrsAnalysis
    };
  });

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Calculate upcoming reviews
  const upcomingReviews = [
    { date: 'Today', count: dueCards.length },
    { date: 'Tomorrow', count: 0 }, // Would need more complex calculation
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 0 }
  ];

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'destructive';
      default: return 'secondary';
    }
  };

  if (showStudyMode) {
    return <FSRSStudyMode onBack={() => setShowStudyMode(false)} />;
  }

  return (
    <div className="p-6 space-y-6 relative">
      <FirstVisitTooltip 
        page="stats"
        title="Statistics Overview"
        description="Here you can track your learning progress, performance metrics, and study patterns across all your courses."
      />
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

      {/* General Overview Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">General Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCards}</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active study files
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Studied Today</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studiedToday}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Progress value={(stats.studiedToday / dailyTarget) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round((stats.studiedToday / dailyTarget) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accuracy}%</div>
                <p className="text-xs text-success">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Good performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streak} days</div>
                <p className="text-xs text-muted-foreground">
                  Keep it up!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Due Cards Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Due Cards Overview</span>
            </CardTitle>
            <CardDescription>Cards scheduled for review across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Cards due today:</span>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-lg px-3 py-1">{dueCards.length} cards</Badge>
                <Button 
                  onClick={() => setShowStudyMode(true)}
                  className="flex items-center space-x-2"
                  disabled={dueCards.length === 0}
                >
                  <Play className="h-4 w-4" />
                  <span>Study Now</span>
                </Button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">FSRS Optimization</h4>
              <p className="text-xs text-muted-foreground">
                Your review schedule is optimized for 90% retention rate. 
                Focus on the cards with lowest confidence first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-Specific Analytics */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Course Analytics</h2>
          <p className="text-muted-foreground text-sm">Click on any course to view detailed performance metrics</p>
        </div>

        {courseStats.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <Collapsible 
              open={expandedCourses.includes(course.id)}
              onOpenChange={() => toggleCourse(course.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {course.color && (
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <CardDescription>
                          {course.decksCount} deck{course.decksCount !== 1 ? 's' : ''} • {course.totalCards} total cards
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getConfidenceColor(course.confidence) as any}>
                            {course.confidence}
                          </Badge>
                          <span className="font-bold text-lg">{course.accuracy}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {course.studiedCards} cards studied
                        </p>
                      </div>
                      {expandedCourses.includes(course.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Progress value={course.accuracy} className="h-2 mt-2" />
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* FSRS Priority Alert */}
                  {course.fsrsAnalysis.urgentCards.length > 0 && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="font-semibold text-destructive">
                          {course.fsrsAnalysis.urgentCards.length} Urgent Cards
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        These cards are overdue or have low retention probability. Study them first!
                      </p>
                    </div>
                  )}

                  {/* FSRS Card States Overview */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>FSRS Learning States</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{course.fsrsAnalysis.newCards.length}</div>
                        <p className="text-xs text-blue-600">New Cards</p>
                        <p className="text-xs text-muted-foreground">Never studied</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{course.fsrsAnalysis.learningCards.length}</div>
                        <p className="text-xs text-orange-600">Learning</p>
                        <p className="text-xs text-muted-foreground">Being learned</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{course.fsrsAnalysis.reviewCards.length}</div>
                        <p className="text-xs text-green-600">Review</p>
                        <p className="text-xs text-muted-foreground">In review cycle</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{course.fsrsAnalysis.relearningCards.length}</div>
                        <p className="text-xs text-red-600">Relearning</p>
                        <p className="text-xs text-muted-foreground">Need relearning</p>
                      </div>
                    </div>
                  </div>

                  {/* Retention Analysis */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Retention Analysis</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="font-medium">High Retention</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ≥90%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {course.fsrsAnalysis.highRetention.length}
                        </div>
                        <Progress value={(course.fsrsAnalysis.highRetention.length / course.totalCards) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((course.fsrsAnalysis.highRetention.length / course.totalCards) * 100)}% of total cards
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">Medium Retention</span>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            70-89%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                          {course.fsrsAnalysis.mediumRetention.length}
                        </div>
                        <Progress value={(course.fsrsAnalysis.mediumRetention.length / course.totalCards) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((course.fsrsAnalysis.mediumRetention.length / course.totalCards) * 100)}% of total cards
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="font-medium">Low Retention</span>
                          </div>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            &lt;70%
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {course.fsrsAnalysis.lowRetention.length}
                        </div>
                        <Progress value={(course.fsrsAnalysis.lowRetention.length / course.totalCards) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((course.fsrsAnalysis.lowRetention.length / course.totalCards) * 100)}% of total cards
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Distribution */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Difficulty Distribution</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{course.fsrsAnalysis.easyCards.length}</div>
                          <p className="text-sm font-medium text-green-600">Easy Cards</p>
                          <p className="text-xs text-muted-foreground">Difficulty ≤ 3.0</p>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{course.fsrsAnalysis.mediumCards.length}</div>
                          <p className="text-sm font-medium text-yellow-600">Medium Cards</p>
                          <p className="text-xs text-muted-foreground">Difficulty 3.1-7.0</p>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{course.fsrsAnalysis.hardCards.length}</div>
                          <p className="text-sm font-medium text-red-600">Hard Cards</p>
                          <p className="text-xs text-muted-foreground">Difficulty &gt; 7.0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FSRS Performance Metrics */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span>FSRS Performance Metrics</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(course.fsrsAnalysis.averageInterval)}
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Interval (days)</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {course.fsrsAnalysis.averageStability.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Stability</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{course.fsrsAnalysis.totalReviews}</div>
                        <p className="text-xs text-muted-foreground">Total Reviews</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-destructive">{course.fsrsAnalysis.overdueCards.length}</div>
                        <p className="text-xs text-muted-foreground">Overdue Cards</p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Deck Performance with FSRS data */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Deck Performance Breakdown</span>
                    </h4>
                    <div className="space-y-3">
                      {course.deckPerformance.map((deck, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{deck.name}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {deck.accuracy}% accuracy
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Difficulty: {deck.avgDifficulty.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-primary">{deck.totalCards}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-orange-600">{deck.dueCards}</div>
                              <div className="text-xs text-muted-foreground">Due</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">{deck.matureCards}</div>
                              <div className="text-xs text-muted-foreground">Mature</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{deck.studiedCards}</div>
                              <div className="text-xs text-muted-foreground">Studied</div>
                            </div>
                          </div>
                          <Progress value={deck.accuracy} className="h-2 mt-3" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Activity for this course */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Weekly Activity</span>
                    </h4>
                    <div className="flex items-end space-x-2 h-24 bg-muted/30 rounded-lg p-3">
                      {course.weeklyActivity.map((value, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary rounded-t-sm min-h-[2px]"
                            style={{ height: `${Math.max((value / Math.max(...course.weeklyActivity)) * 60, 2)}px` }}
                          />
                          <span className="text-xs text-muted-foreground mt-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cards studied per day over the last week
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}