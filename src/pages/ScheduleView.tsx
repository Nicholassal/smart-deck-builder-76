import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FirstVisitGuide } from '@/components/FirstVisitGuide';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, Plus, CheckCircle2, AlertCircle, Edit2, GraduationCap, MapPin, Timer } from 'lucide-react';
import { FirstVisitTooltip } from '@/components/ui/first-visit-tooltip';
import { useDataStore } from '@/hooks/useDataStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon, Trash2 } from 'lucide-react';

export function ScheduleView() {
  const { files, exams, createExam, updateExam, deleteExam, updateStudyProgress, getDueCards, getPerformanceData } = useDataStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showEditExam, setShowEditExam] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [selectedStudySession, setSelectedStudySession] = useState<any>(null);
  const [editingExam, setEditingExam] = useState<any>(null);

  // Create exam form state
  const [examForm, setExamForm] = useState({
    name: '',
    date: undefined as Date | undefined,
    selectedFiles: [] as string[],
    selectedDecks: [] as string[],
    time: '',
    location: '',
    duration: '',
  });

  // Study progress form state
  const [studyProgress, setStudyProgress] = useState({
    completed: false,
    skipped: false,
    actualMinutes: '',
    completionPercentage: '',
  });

  // Calendar utilities
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get study sessions for calendar
  const getStudySessionsForDate = (date: Date) => {
    return exams.flatMap(exam => 
      exam.studyPlan.filter(session => 
        isSameDay(new Date(session.date), date)
      ).map(session => ({ ...session, exam, color: exam.color }))
    );
  };

  // Check if date is an exam date
  const isExamDate = (date: Date) => {
    return exams.some(exam => isSameDay(new Date(exam.date), date));
  };

  // Get exams for date (multiple exams possible)
  const getExamsForDate = (date: Date) => {
    return exams.filter(exam => isSameDay(new Date(exam.date), date));
  };

  const handleCreateExam = () => {
    if (examForm.name && examForm.date && examForm.selectedDecks.length > 0) {
      createExam(
        examForm.name, 
        examForm.date, 
        examForm.selectedFiles, 
        examForm.selectedDecks,
        examForm.time || undefined,
        examForm.location || undefined,
        examForm.duration ? parseInt(examForm.duration) : undefined
      );
      setExamForm({ name: '', date: undefined, selectedFiles: [], selectedDecks: [], time: '', location: '', duration: '' });
      setShowCreateExam(false);
    }
  };

  const handleEditExam = () => {
    if (editingExam && examForm.name && examForm.date && examForm.selectedDecks.length > 0) {
      updateExam(editingExam.id, {
        name: examForm.name,
        date: examForm.date,
        fileIds: examForm.selectedFiles,
        deckIds: examForm.selectedDecks,
        time: examForm.time || undefined,
        location: examForm.location || undefined,
        duration: examForm.duration ? parseInt(examForm.duration) : undefined,
      });
      setEditingExam(null);
      setExamForm({ name: '', date: undefined, selectedFiles: [], selectedDecks: [], time: '', location: '', duration: '' });
      setShowEditExam(false);
    }
  };

  const openEditExam = (exam: any) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      date: new Date(exam.date),
      selectedFiles: exam.fileIds,
      selectedDecks: exam.deckIds,
      time: exam.time || '',
      location: exam.location || '',
      duration: exam.duration?.toString() || '',
    });
    setShowEditExam(true);
  };

  const handleDeleteExam = (examId: string) => {
    deleteExam(examId);
    setShowEditExam(false);
    setEditingExam(null);
  };

  const handleStudyProgress = () => {
    if (selectedStudySession) {
      updateStudyProgress(
        selectedStudySession.exam.id,
        new Date(selectedStudySession.date),
        selectedStudySession.deckId,
        studyProgress.completed,
        studyProgress.actualMinutes ? parseInt(studyProgress.actualMinutes) : undefined,
        studyProgress.completionPercentage ? parseInt(studyProgress.completionPercentage) : undefined,
        studyProgress.skipped
      );
      setShowStudyModal(false);
      setStudyProgress({ completed: false, skipped: false, actualMinutes: '', completionPercentage: '' });
    }
  };

  const handleDateClick = (date: Date) => {
    const sessions = getStudySessionsForDate(date);
    const examsOnDate = getExamsForDate(date);
    
    if (sessions.length > 0) {
      // If multiple sessions, show first one (could be enhanced to show selection dialog)
      setSelectedStudySession(sessions[0]);
      setStudyProgress({
        completed: sessions[0].completed,
        skipped: sessions[0].skipped,
        actualMinutes: sessions[0].actualMinutes?.toString() || '',
        completionPercentage: sessions[0].completionPercentage?.toString() || '',
      });
      setShowStudyModal(true);
    } else if (examsOnDate.length > 0) {
      // Show exam info or could open edit dialog
      console.log('Exams on this date:', examsOnDate);
    }
  };

  const availableDecks = files.flatMap(file => 
    file.decks.map(deck => ({ ...deck, fileName: file.name, fileColor: file.color }))
  );

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
        <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exam-name">Exam Name</Label>
                <Input
                  id="exam-name"
                  value={examForm.name}
                  onChange={(e) => setExamForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Calculus II Midterm"
                />
              </div>
              
              <div>
                <Label>Exam Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examForm.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examForm.date ? format(examForm.date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={examForm.date}
                      onSelect={(date) => setExamForm(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="exam-time">Time</Label>
                  <div className="flex gap-1">
                    <Select value={examForm.time.split(':')[0] || ''} onValueChange={(hour) => {
                      const minute = examForm.time.split(':')[1]?.split(' ')[0] || '00';
                      const period = examForm.time.includes('PM') ? 'PM' : 'AM';
                      setExamForm(prev => ({ ...prev, time: `${hour}:${minute} ${period}` }));
                    }}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                          <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select value={examForm.time.split(':')[1]?.split(' ')[0] || ''} onValueChange={(minute) => {
                      const hour = examForm.time.split(':')[0] || '09';
                      const period = examForm.time.includes('PM') ? 'PM' : 'AM';
                      setExamForm(prev => ({ ...prev, time: `${hour}:${minute} ${period}` }));
                    }}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {['00', '15', '30', '45'].map(minute => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={examForm.time.includes('PM') ? 'PM' : examForm.time.includes('AM') ? 'AM' : ''} onValueChange={(period) => {
                      const timePart = examForm.time.split(' ')[0] || '09:00';
                      setExamForm(prev => ({ ...prev, time: `${timePart} ${period}` }));
                    }}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="exam-duration">Duration (min)</Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    value={examForm.duration}
                    onChange={(e) => setExamForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exam-location">Location</Label>
                <Input
                  id="exam-location"
                  value={examForm.location}
                  onChange={(e) => setExamForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Room 101, Science Building"
                />
              </div>

              <div>
                <Label>Select Decks to Study</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 mt-2 border rounded-md p-2">
                  {availableDecks.map((deck) => (
                    <div key={deck.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={deck.id}
                        checked={examForm.selectedDecks.includes(deck.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExamForm(prev => ({
                              ...prev,
                              selectedDecks: [...prev.selectedDecks, deck.id],
                              selectedFiles: [...new Set([...prev.selectedFiles, deck.fileId])]
                            }));
                          } else {
                            setExamForm(prev => ({
                              ...prev,
                              selectedDecks: prev.selectedDecks.filter(id => id !== deck.id)
                            }));
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: deck.fileColor }}
                        />
                        <Label htmlFor={deck.id} className="text-sm">
                          {deck.fileName} - {deck.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateExam} className="flex-1">
                  Create Exam
                </Button>
                <Button variant="outline" onClick={() => setShowCreateExam(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const daysUntil = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const completedSessions = exam.studyPlan.filter(s => s.completed).length;
          const totalSessions = exam.studyPlan.length;
          const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
          
          // Calculate confidence based on deck performance
          const deckPerformances = exam.deckIds.map(deckId => getPerformanceData(deckId).averageAccuracy);
          const avgConfidence = deckPerformances.length > 0 
            ? deckPerformances.reduce((sum, acc) => sum + acc, 0) / deckPerformances.length 
            : 50;

          return (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: exam.color }}
                    />
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {daysUntil > 0 ? `${daysUntil} days` : 'Today!'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditExam(exam)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    {format(new Date(exam.date), 'PPP')}
                    {exam.time && (
                      <>
                        <Clock className="h-4 w-4 inline ml-4 mr-1" />
                        {exam.time}
                      </>
                    )}
                  </div>
                  {exam.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      {exam.location}
                    </div>
                  )}
                  {exam.duration && (
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 inline mr-2" />
                      {exam.duration} minutes
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Study Progress</span>
                    <span>{completedSessions} of {totalSessions} sessions</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Confidence Level</span>
                    <Badge variant={avgConfidence >= 80 ? 'default' : avgConfidence >= 60 ? 'secondary' : 'destructive'}>
                      {Math.round(avgConfidence)}%
                    </Badge>
                  </div>
                  <Progress value={avgConfidence} className="h-2" />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Included Decks:</p>
                  <div className="flex flex-wrap gap-1">
                    {exam.deckIds.map((deckId) => {
                      const deck = availableDecks.find(d => d.id === deckId);
                      return deck ? (
                        <Badge key={deckId} variant="secondary" className="text-xs">
                          {deck.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Study Calendar</CardTitle>
              <CardDescription>
                Click on days with study sessions to track your progress. Exam dates are marked with a graduation cap.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                ←
              </Button>
              <span className="font-medium min-w-[100px] text-center">
                {format(currentMonth, 'MMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((date) => {
              const sessions = getStudySessionsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday_ = isToday(date);
              const hasExam = isExamDate(date);
              const examsOnDate = getExamsForDate(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "p-2 min-h-[80px] border border-border rounded cursor-pointer relative hover:bg-accent transition-colors",
                    !isCurrentMonth && "text-muted-foreground bg-muted/50",
                    isToday_ && "bg-primary/10 border-primary",
                    sessions.length > 0 && "bg-accent",
                    hasExam && "bg-gradient-to-br from-yellow-100 to-amber-100 border-amber-300 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-amber-600"
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="text-sm font-medium">
                    {format(date, 'd')}
                  </div>
                  
                  {/* Multiple exam indicators */}
                  {hasExam && (
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      {examsOnDate.map((exam, index) => (
                        <div key={exam.id} title={`Exam: ${exam.name}${exam.time ? ` at ${exam.time}` : ''}`}>
                          <GraduationCap 
                            className="w-3 h-3" 
                            style={{ color: exam.color }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Study session indicators - grouped by color/topic */}
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="flex flex-wrap gap-1">
                      {sessions.map((session, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            session.completed && "ring-1 ring-green-500 ring-offset-1",
                            session.skipped && "opacity-50"
                          )}
                          style={{ backgroundColor: session.color }}
                          title={`Study session for ${session.exam.name} - ${session.completed ? 'Completed' : session.skipped ? 'Skipped' : 'Pending'}`}
                        />
                      ))}
                    </div>
                    
                    {/* Show count if more than 6 sessions */}
                    {sessions.length > 6 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        +{sessions.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Exam Modal */}
      <Dialog open={showEditExam} onOpenChange={setShowEditExam}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-exam-name">Exam Name</Label>
              <Input
                id="edit-exam-name"
                value={examForm.name}
                onChange={(e) => setExamForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Calculus II Midterm"
              />
            </div>
            
            <div>
              <Label>Exam Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !examForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {examForm.date ? format(examForm.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={examForm.date}
                    onSelect={(date) => setExamForm(prev => ({ ...prev, date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-exam-time">Time</Label>
                <Input
                  id="edit-exam-time"
                  value={examForm.time}
                  onChange={(e) => setExamForm(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="9:00 AM"
                />
              </div>
              <div>
                <Label htmlFor="edit-exam-duration">Duration (min)</Label>
                <Input
                  id="edit-exam-duration"
                  type="number"
                  value={examForm.duration}
                  onChange={(e) => setExamForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="120"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-exam-location">Location</Label>
              <Input
                id="edit-exam-location"
                value={examForm.location}
                onChange={(e) => setExamForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Room 101, Science Building"
              />
            </div>

            <div>
              <Label>Select Decks to Study</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 mt-2 border rounded-md p-2">
                {availableDecks.map((deck) => (
                  <div key={deck.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${deck.id}`}
                      checked={examForm.selectedDecks.includes(deck.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExamForm(prev => ({
                            ...prev,
                            selectedDecks: [...prev.selectedDecks, deck.id],
                            selectedFiles: [...new Set([...prev.selectedFiles, deck.fileId])]
                          }));
                        } else {
                          setExamForm(prev => ({
                            ...prev,
                            selectedDecks: prev.selectedDecks.filter(id => id !== deck.id)
                          }));
                        }
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: deck.fileColor }}
                      />
                      <Label htmlFor={`edit-${deck.id}`} className="text-sm">
                        {deck.fileName} - {deck.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditExam} className="flex-1">
                Save Changes
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => editingExam && handleDeleteExam(editingExam.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowEditExam(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Study Session Modal */}
      <Dialog open={showStudyModal} onOpenChange={setShowStudyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Study Session Progress</DialogTitle>
          </DialogHeader>
          {selectedStudySession && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border" style={{ borderColor: selectedStudySession.color }}>
                <h3 className="font-medium">{selectedStudySession.exam.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedStudySession.date), 'PPP')}
                </p>
                <p className="text-sm">
                  Estimated time: {selectedStudySession.estimatedMinutes} minutes
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={studyProgress.completed}
                    onCheckedChange={(checked) => setStudyProgress(prev => ({ 
                      ...prev, 
                      completed: !!checked,
                      skipped: false
                    }))}
                  />
                  <Label htmlFor="completed">Completed study session</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipped"
                    checked={studyProgress.skipped}
                    onCheckedChange={(checked) => setStudyProgress(prev => ({ 
                      ...prev, 
                      skipped: !!checked,
                      completed: false
                    }))}
                  />
                  <Label htmlFor="skipped">Skipped this session</Label>
                </div>

                {studyProgress.completed && (
                  <>
                    <div>
                      <Label htmlFor="actual-minutes">Actual minutes studied</Label>
                      <Input
                        id="actual-minutes"
                        type="number"
                        value={studyProgress.actualMinutes}
                        onChange={(e) => setStudyProgress(prev => ({ ...prev, actualMinutes: e.target.value }))}
                        placeholder={selectedStudySession.estimatedMinutes.toString()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="completion-percentage">Completion percentage</Label>
                      <Input
                        id="completion-percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={studyProgress.completionPercentage}
                        onChange={(e) => setStudyProgress(prev => ({ ...prev, completionPercentage: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStudyProgress} className="flex-1">
                  Update Progress
                </Button>
                <Button variant="outline" onClick={() => setShowStudyModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}