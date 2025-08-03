import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FirstVisitGuide } from '@/components/FirstVisitGuide';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendingUp, Brain, Clock, Target, Calendar, BookOpen, ChevronDown, ChevronRight, BarChart3, Users } from 'lucide-react';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { useDataStore } from '@/hooks/useDataStore';
import { useState } from 'react';

export function StatsView() {
  const { getStudyStats, getDueCards, files, sessions } = useDataStore();
  const stats = getStudyStats();
  const dueCards = getDueCards();
  const dailyTarget = 30; // Default daily target
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  
  // Calculate detailed course statistics
  const courseStats = files.map(file => {
    const allCards = file.decks.flatMap(deck => 
      deck.sections.flatMap(section => section.flashcards)
    );
    const fileSessions = sessions.filter(session => 
      allCards.some(card => card.id === session.flashcardId)
    );
    const correctSessions = fileSessions.filter(s => s.isCorrect);
    const accuracy = fileSessions.length > 0 ? Math.round((correctSessions.length / fileSessions.length) * 100) : 0;
    
    // Calculate deck-wise performance
    const deckPerformance = file.decks.map(deck => {
      const deckCards = deck.sections.flatMap(section => section.flashcards);
      const deckSessions = sessions.filter(session => 
        deckCards.some(card => card.id === session.flashcardId)
      );
      const deckCorrect = deckSessions.filter(s => s.isCorrect);
      const deckAccuracy = deckSessions.length > 0 ? Math.round((deckCorrect.length / deckSessions.length) * 100) : 0;
      
      return {
        name: deck.name,
        accuracy: deckAccuracy,
        totalCards: deckCards.length,
        studiedCards: deckSessions.length,
        correctCards: deckCorrect.length
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
      decksCount: file.decks.length
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
              <Badge variant="outline" className="text-lg px-3 py-1">{dueCards.length} cards</Badge>
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
                  {/* Course Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{course.totalCards}</div>
                      <p className="text-xs text-muted-foreground">Total Cards</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{course.studiedCards}</div>
                      <p className="text-xs text-muted-foreground">Cards Studied</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-success">{course.correctCards}</div>
                      <p className="text-xs text-muted-foreground">Correct Answers</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">{course.studiedCards - course.correctCards}</div>
                      <p className="text-xs text-muted-foreground">Incorrect Answers</p>
                    </div>
                  </div>

                  {/* Deck Performance */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Deck Performance</span>
                    </h4>
                    <div className="space-y-3">
                      {course.deckPerformance.map((deck, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{deck.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold">{deck.accuracy}%</span>
                              <Badge variant="outline" className="text-xs">
                                {deck.studiedCards}/{deck.totalCards} studied
                              </Badge>
                            </div>
                          </div>
                          <Progress value={deck.accuracy} className="h-2" />
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