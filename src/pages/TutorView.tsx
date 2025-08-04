import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Brain, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/hooks/useDataStore';
import { fsrsScheduler } from '@/lib/fsrs';
import { Flashcard } from '@/types/flashcard';

/* 
 * AI TUTOR DOCUMENTATION FOR BACKEND IMPLEMENTATION
 * 
 * This component requires the following backend integrations:
 * 
 * 1. LLM API Integration (OpenAI, Anthropic, etc.):
 *    - Endpoint: POST /api/tutor/ask-question
 *    - Purpose: Generate contextual questions based on knowledge base
 *    - Payload: { fileId, deckId, difficulty, previousQuestions }
 *    - Response: { question, expectedAnswer, context, sources }
 * 
 * 2. Speech-to-Text API:
 *    - Endpoint: POST /api/speech/transcribe
 *    - Purpose: Convert user's spoken answer to text
 *    - Payload: audio blob (FormData)
 *    - Response: { transcription, confidence }
 * 
 * 3. Text-to-Speech API:
 *    - Endpoint: POST /api/speech/synthesize
 *    - Purpose: Convert AI responses to speech
 *    - Payload: { text, voice, speed }
 *    - Response: audio blob
 * 
 * 4. Knowledge Base Integration:
 *    - Endpoint: GET /api/knowledge/context
 *    - Purpose: Retrieve relevant context from uploaded PDFs/documents
 *    - Query: ?fileId=x&query=y&limit=5
 *    - Response: { contexts: [{ text, source, relevance }] }
 * 
 * 5. FSRS Integration:
 *    - Use existing FSRS logic to determine next question timing
 *    - Update card data based on user performance (correct/incorrect/needs_help)
 * 
 * Required Environment Variables in Supabase Secrets:
 * - OPENAI_API_KEY (or ANTHROPIC_API_KEY)
 * - ELEVENLABS_API_KEY (for TTS)
 * - DEEPGRAM_API_KEY (for STT, alternative: OpenAI Whisper)
 */

interface TutorSession {
  id: string;
  fileId: string;
  deckId?: string;
  currentQuestion?: {
    text: string;
    expectedAnswer: string;
    context: string;
    sources: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  isListening: boolean;
  isProcessing: boolean;
  showAnswer: boolean;
  userResponse?: string;
  needsHelp: boolean;
}

export function TutorView() {
  const { files } = useDataStore();
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [session, setSession] = useState<TutorSession | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get available files and decks
  const selectedFile = files.find(f => f.id === selectedFileId);
  const availableDecks = selectedFile?.decks || [];

  // Load study cards when file/deck selection changes
  useEffect(() => {
    if (selectedFileId) {
      // TODO: Backend - Load cards from selected file/deck
      // This should integrate with FSRS to prioritize due cards
      const allCards: Flashcard[] = [];
      
      if (selectedDeckId && selectedDeckId !== 'all') {
        const deck = selectedFile?.decks.find(d => d.id === selectedDeckId);
        deck?.sections.forEach(section => {
          allCards.push(...section.flashcards);
        });
      } else {
        selectedFile?.decks.forEach(deck => {
          deck.sections.forEach(section => {
            allCards.push(...section.flashcards);
          });
        });
      }

      // Use FSRS to prioritize cards
      const dueCards = fsrsScheduler.getDueCards(allCards.map(card => card.fsrsData));
      const prioritizedCards = allCards.filter(card => 
        dueCards.some(due => due.nextReview <= new Date())
      );
      
      setStudyCards(prioritizedCards);
    }
  }, [selectedFileId, selectedDeckId, selectedFile]);

  const startTutorSession = async () => {
    if (!selectedFileId || studyCards.length === 0) return;

    try {
      // TODO: Backend API Call - Initialize tutor session
      // const response = await fetch('/api/tutor/start-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fileId: selectedFileId,
      //     deckId: selectedDeckId,
      //     cardCount: studyCards.length
      //   })
      // });
      // const sessionData = await response.json();

      // Mock session for now
      setSession({
        id: 'session-' + Date.now(),
        fileId: selectedFileId,
        deckId: selectedDeckId === 'all' ? undefined : selectedDeckId,
        isListening: false,
        isProcessing: false,
        showAnswer: false,
        needsHelp: false
      });

      // Generate first question
      await generateNextQuestion();
    } catch (error) {
      console.error('Failed to start tutor session:', error);
    }
  };

  const generateNextQuestion = async () => {
    if (!session) return;

    setSession(prev => prev ? { ...prev, isProcessing: true } : null);

    try {
      // TODO: Backend API Call - Generate question using LLM
      // const response = await fetch('/api/tutor/ask-question', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fileId: session.fileId,
      //     deckId: session.deckId,
      //     difficulty: 'medium',
      //     previousQuestions: [] // Track to avoid repetition
      //   })
      // });
      // const questionData = await response.json();

      // Mock question for now - use actual flashcard data
      const randomCard = studyCards[Math.floor(Math.random() * studyCards.length)];
      const mockQuestion = {
        text: randomCard?.question || "What is the main concept in this study material?",
        expectedAnswer: randomCard?.answer || "This is the expected answer from the knowledge base.",
        context: "This information comes from your uploaded study materials.",
        sources: ["Study Guide Chapter 3", "Lecture Notes Week 5"],
        difficulty: 'medium' as const
      };

      setSession(prev => prev ? {
        ...prev,
        currentQuestion: mockQuestion,
        isProcessing: false,
        showAnswer: false,
        userResponse: undefined,
        needsHelp: false
      } : null);

      // Speak the question if voice is enabled
      if (isVoiceEnabled) {
        await speakText(mockQuestion.text);
      }
    } catch (error) {
      console.error('Failed to generate question:', error);
      setSession(prev => prev ? { ...prev, isProcessing: false } : null);
    }
  };

  const startListening = async () => {
    if (!session) return;

    try {
      // TODO: Backend Integration - Speech-to-Text
      // This requires Web Speech API or integration with external STT service
      setSession(prev => prev ? { ...prev, isListening: true } : null);

      // Mock listening for now
      setTimeout(() => {
        const mockResponse = "This is a mock user response that would come from speech recognition.";
        setSession(prev => prev ? {
          ...prev,
          isListening: false,
          userResponse: mockResponse
        } : null);
      }, 3000);

    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };

  const stopListening = () => {
    setSession(prev => prev ? { ...prev, isListening: false } : null);
  };

  const speakText = async (text: string) => {
    if (!isVoiceEnabled) return;

    try {
      // TODO: Backend API Call - Text-to-Speech
      // const response = await fetch('/api/speech/synthesize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     text,
      //     voice: 'alloy', // or user preference
      //     speed: 1.0
      //   })
      // });
      // const audioBlob = await response.blob();
      // const audioUrl = URL.createObjectURL(audioBlob);
      
      // if (audioRef.current) {
      //   audioRef.current.src = audioUrl;
      //   audioRef.current.play();
      // }

      // Mock TTS for now using Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to synthesize speech:', error);
    }
  };

  const showAnswer = () => {
    setSession(prev => prev ? { ...prev, showAnswer: true } : null);
    if (session?.currentQuestion && isVoiceEnabled) {
      speakText(session.currentQuestion.expectedAnswer);
    }
  };

  const requestHelp = async () => {
    if (!session?.currentQuestion) return;

    setSession(prev => prev ? { ...prev, needsHelp: true } : null);

    try {
      // TODO: Backend API Call - Get contextual help
      // const response = await fetch('/api/knowledge/context', {
      //   method: 'GET',
      //   params: {
      //     fileId: session.fileId,
      //     query: session.currentQuestion.text,
      //     limit: 3
      //   }
      // });
      // const contextData = await response.json();

      const helpText = `Here's some additional context: ${session.currentQuestion.context}. This information comes from your study materials.`;
      
      if (isVoiceEnabled) {
        speakText(helpText);
      }
    } catch (error) {
      console.error('Failed to get help:', error);
    }
  };

  const markResponse = async (correct: boolean) => {
    if (!session?.currentQuestion) return;

    // TODO: Backend - Update FSRS data based on response
    // const updatedFSRS = fsrsScheduler.review(
    //   currentCard.fsrsData, 
    //   correct ? 'good' : 'again'
    // );

    // Generate next question
    setTimeout(() => {
      generateNextQuestion();
    }, 1500);
  };

  const endSession = () => {
    setSession(null);
    setStudyCards([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Brain className="h-8 w-8 mr-3 text-primary" />
          AI Tutor
        </h1>
        <p className="text-muted-foreground">
          Get personalized tutoring with voice interaction and contextual explanations
        </p>
      </div>

      {!session ? (
        <div className="space-y-6">
          {/* Setup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Choose Study Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select File</label>
                <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a study file..." />
                  </SelectTrigger>
                  <SelectContent>
                    {files.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFileId && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Deck (Optional)</label>
                  <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All decks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Decks</SelectItem>
                      {availableDecks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant={isVoiceEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {isVoiceEnabled ? "Voice Enabled" : "Voice Disabled"}
                </Button>
              </div>

              {selectedFileId && studyCards.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to study {studyCards.length} cards with FSRS-optimized scheduling
                  </p>
                  <Button onClick={startTutorSession} className="w-full">
                    Start AI Tutoring Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>How AI Tutor Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">🎯 Personalized Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    AI generates questions based on your uploaded materials and FSRS scheduling
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🎤 Voice Interaction</h4>
                  <p className="text-sm text-muted-foreground">
                    Speak your answers naturally and hear questions read aloud
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">📚 Contextual Help</h4>
                  <p className="text-sm text-muted-foreground">
                    Get explanations and context from your study materials
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🧠 FSRS Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimized spaced repetition based on your performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Current Question
                </span>
                <Badge variant="outline">
                  {session.currentQuestion?.difficulty || 'medium'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your next question...</p>
                </div>
              ) : session.currentQuestion ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg">{session.currentQuestion.text}</p>
                  </div>

                  {/* Voice Controls */}
                  <div className="flex flex-wrap gap-2">
                    {!session.isListening ? (
                      <Button onClick={startListening} variant="default">
                        <Mic className="h-4 w-4 mr-2" />
                        Speak Answer
                      </Button>
                    ) : (
                      <Button onClick={stopListening} variant="destructive">
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Listening
                      </Button>
                    )}
                    
                    <Button onClick={showAnswer} variant="outline">
                      Show Answer
                    </Button>
                    
                    <Button onClick={requestHelp} variant="outline">
                      Need Help?
                    </Button>
                  </div>

                  {session.isListening && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Listening... Speak your answer</span>
                      </div>
                    </div>
                  )}

                  {session.userResponse && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium mb-2">Your Response:</h4>
                      <p className="text-sm">{session.userResponse}</p>
                    </div>
                  )}

                  {session.showAnswer && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-medium mb-2">Expected Answer:</h4>
                        <p className="mb-3">{session.currentQuestion.expectedAnswer}</p>
                        
                        {session.needsHelp && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <h5 className="font-medium mb-1">Additional Context:</h5>
                            <p className="text-sm">{session.currentQuestion.context}</p>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Sources:</p>
                              {session.currentQuestion.sources.map((source, index) => (
                                <Badge key={index} variant="secondary" className="mr-1 mt-1">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => markResponse(true)} variant="default" className="flex-1">
                          ✓ Got it Right
                        </Button>
                        <Button onClick={() => markResponse(false)} variant="outline" className="flex-1">
                          ✗ Need to Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Session Controls */}
          <div className="flex justify-between">
            <Button onClick={endSession} variant="outline">
              End Session
            </Button>
            <div className="flex gap-2">
              <Button onClick={generateNextQuestion} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Skip Question
              </Button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

export default TutorView;