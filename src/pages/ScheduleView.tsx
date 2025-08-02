import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';

export function ScheduleView() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  // Mock data - would come from database
  const upcomingExams = [
    {
      id: '1',
      name: 'Calculus II Midterm',
      date: '2024-08-15',
      topics: ['Integration', 'Series', 'Differential Equations'],
      daysUntil: 12,
      sessionsCompleted: 5,
      totalSessions: 12,
      confidence: 72
    },
    {
      id: '2', 
      name: 'Physics Final',
      date: '2024-08-25',
      topics: ['Electromagnetism', 'Optics', 'Quantum'],
      daysUntil: 22,
      sessionsCompleted: 2,
      totalSessions: 18,
      confidence: 45
    }
  ];

  const studyPlan = [
    { date: 'Today', topic: 'Integration Techniques', status: 'pending', sessions: 2 },
    { date: 'Tomorrow', topic: 'Series Convergence', status: 'scheduled', sessions: 1 },
    { date: 'Thu Aug 8', topic: 'Differential Equations', status: 'scheduled', sessions: 2 },
    { date: 'Fri Aug 9', topic: 'Integration Review', status: 'scheduled', sessions: 1 }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'destructive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <FirstVisitTooltip 
        page="schedule"
        title="Dynamic Study Schedule"
        description="Set exam dates and let AI create personalized study plans that adapt based on your performance and available time."
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Study Schedule</h1>
          <p className="text-muted-foreground">AI-powered study plans tailored to your exams</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Exam
        </Button>
      </div>

      {/* Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingExams.map((exam) => (
          <Card key={exam.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{exam.name}</CardTitle>
                <Badge variant="outline">{exam.daysUntil} days</Badge>
              </div>
              <CardDescription>
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(exam.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{exam.sessionsCompleted} of {exam.totalSessions} sessions</span>
                </div>
                <Progress value={(exam.sessionsCompleted / exam.totalSessions) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Confidence Level</span>
                  <Badge variant={getConfidenceColor(exam.confidence) as any}>
                    {exam.confidence}%
                  </Badge>
                </div>
                <Progress value={exam.confidence} className="h-2" />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {exam.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Study Plan */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Study Plan</CardTitle>
          <CardDescription>
            Optimized schedule based on your exam dates and current performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studyPlan.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <p className="font-medium">{session.date}</p>
                    <p className="text-sm text-muted-foreground">{session.topic}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{session.sessions} sessions</Badge>
                  {session.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      Start Study
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📈 Increase Integration practice
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Your accuracy on Integration problems is 65%. Recommend 2 extra sessions this week.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✅ Series mastery achieved
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Great job! You can reduce Series review from 3 to 1 session per week.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}