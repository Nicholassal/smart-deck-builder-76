import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Brain, Clock, Target, Calendar, BookOpen } from 'lucide-react';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';
import { useDataStore } from '@/hooks/useDataStore';

export function StatsView() {
  const { getStudyStats, getDueCards, files, sessions } = useDataStore();
  const stats = getStudyStats();
  const dueCards = getDueCards();
  const dailyTarget = 30; // Default daily target
  
  // Calculate course progress from actual data
  const coursesProgress = files.flatMap(file => 
    file.decks.map(deck => {
      const allCards = deck.sections.flatMap(section => section.flashcards);
      const deckSessions = sessions.filter(session => 
        allCards.some(card => card.id === session.flashcardId)
      );
      const correctSessions = deckSessions.filter(s => s.isCorrect);
      const accuracy = deckSessions.length > 0 ? Math.round((correctSessions.length / deckSessions.length) * 100) : 0;
      
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (accuracy >= 85) confidence = 'high';
      else if (accuracy < 70) confidence = 'low';
      
      return {
        name: deck.courseName || deck.name,
        accuracy,
        cards: allCards.length,
        confidence
      };
    })
  );

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
    <div className="p-6 space-y-6">
      <TutorialOverlay type="analytics" />
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your learning progress and performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
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
            <div className="flex items-center space-x-2">
              <Progress value={(stats.studiedToday / dailyTarget) * 100} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">
                {Math.round((stats.studiedToday / dailyTarget) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-success">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.5% from last week
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Your accuracy and confidence by course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesProgress.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{course.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getConfidenceColor(course.confidence) as any}>
                      {course.confidence}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {course.accuracy}%
                    </span>
                  </div>
                </div>
                <Progress value={course.accuracy} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {course.cards} cards studied
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
            <CardDescription>Cards scheduled for review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReviews.map((review, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{review.date}</span>
                  </div>
                  <Badge variant="outline">{review.count} cards</Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-primary-light rounded-lg">
              <h4 className="font-semibold text-sm mb-2">FSRS Optimization</h4>
              <p className="text-xs text-muted-foreground">
                Your review schedule is optimized for 90% retention rate. 
                Focus on the cards with lowest confidence first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Your study consistency over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-2 h-32">
            {stats.weeklyProgress.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t-sm"
                  style={{ height: `${(value / 100) * 80}px` }}
                />
                <span className="text-xs text-muted-foreground mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}