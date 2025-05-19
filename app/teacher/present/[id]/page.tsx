"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { BrainCircuit, Copy, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Progress } from "../../../../components/ui/progress";
import { useAuth } from "../../../../app/auth-provider";
import { startQuizSession } from "../../../../app/actions/quiz-actions";
import { toast } from "../../../../components/ui/use-toast";
import { supabase } from "../../../../lib/supabase-client";
import { Question } from "../../../../src/models/question";

// Mock quiz data
// const mockQuiz = {
//   id: "quiz1",
//   title: "Science Quiz",
//   code: "SCI123",
//   questions: [
//     {
//       id: 1,
//       text: "What is the chemical symbol for water?",
//       options: [
//         { id: "a", text: "H2O" },
//         { id: "b", text: "CO2" },
//         { id: "c", text: "O2" },
//         { id: "d", text: "NaCl" },
//       ],
//       correctAnswer: "a",
//     },
//     {
//       id: 2,
//       text: "Which planet is known as the Red Planet?",
//       options: [
//         { id: "a", text: "Venus" },
//         { id: "b", text: "Mars" },
//         { id: "c", text: "Jupiter" },
//         { id: "d", text: "Saturn" },
//       ],
//       correctAnswer: "b",
//     },
//     {
//       id: 3,
//       text: "What is the largest organ in the human body?",
//       options: [
//         { id: "a", text: "Heart" },
//         { id: "b", text: "Liver" },
//         { id: "c", text: "Skin" },
//         { id: "d", text: "Brain" },
//       ],
//       correctAnswer: "c",
//     },
//   ],
// }

export default function PresentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [participants, setParticipants] = useState(0);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to present a quiz",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Fetch the quiz data and verify ownership
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .eq("teacher_id", user.id) // Ensure the teacher owns this quiz
          .single();

        if (error || !data) {
          toast({
            title: "Quiz not found",
            description: "You don't have permission to present this quiz.",
            variant: "destructive",
          });
          router.push("/teacher/dashboard");
          return;
        }

        setQuiz(data);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast({
          title: "Error",
          description: "There was a problem loading the quiz.",
          variant: "destructive",
        });
        router.push("/teacher/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, router, user]);

  // Function to start the quiz session
  const handleStartQuiz = async () => {
    if (!quiz || !user) return;

    try {
      const result = await startQuizSession(quiz.id, user.id);

      if (result.success && result.data) {
        setSessionId(result.data.id);
        setIsStarted(true);

        // Subscribe to participant count updates
        subscribeToParticipants(result.data.id);
      } else {
        throw new Error("Failed to start quiz session");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast({
        title: "Error",
        description: "There was a problem starting the quiz session.",
        variant: "destructive",
      });
    }
  };

  // Subscribe to real-time updates for participants
  const subscribeToParticipants = (sessionId: string) => {
    // First get current count
    supabase
      .from("session_participants")
      .select("id", { count: "exact" })
      .eq("session_id", sessionId)
      .then(({ count, error }) => {
        if (!error && count !== null) {
          setParticipants(count);
        }
      });

    // Then subscribe to changes
    const channel = supabase
      .channel(`session_${sessionId}_participants`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          setParticipants((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Rest of your component logic...

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    router.push("/teacher/dashboard");
    return null;
  }

  const currentQuestion =
    isStarted && !showResults && quiz.questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quiz.code);
    alert("Quiz code copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm font-medium">
            <Users className="h-4 w-4" />
            {participants} joined
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/teacher/dashboard")}
          >
            Exit
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        {!isStarted ? (
          <div className="max-w-md mx-auto mt-20">
            <Card className="text-center">
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6">{quiz?.title}</h1>
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    Share this code with your students:
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="text-3xl font-bold">{quiz?.code}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Students can join at{" "}
                    <span className="font-medium">quizwiz.com/join</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div className="text-lg font-medium">
                    {participants} participants
                  </div>
                </div>
                <Button size="lg" className="w-full" onClick={handleStartQuiz}>
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : showResults ? (
          <div className="max-w-3xl mx-auto mt-10">
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-6 text-center">
                  Quiz Results
                </h1>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Overall Performance
                    </div>
                    <div className="text-4xl font-bold text-primary">78%</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Average Score
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                      Question Breakdown
                    </h2>

                    {quiz.questions.map((question: Question, index: number) => (
                      <div key={question.id} className="space-y-2">
                        <div className="font-medium">
                          Question {index + 1}: {question.text}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">S
                            Correct: 65%
                          </div>
                          <Progress value={65} className="w-2/3 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Top Performers</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">John Doe</div>
                        <div className="text-primary font-bold">95%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Jane Smith</div>
                        <div className="text-primary font-bold">90%</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Alex Johnson</div>
                        <div className="text-primary font-bold">85%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  <Button onClick={() => router.push("/teacher/dashboard")}>
                    Back to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    Export Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of{" "}
                  {quiz?.questions?.length}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  {participants} participants
                </div>
              </div>
              <Progress
                value={(currentQuestionIndex / quiz?.questions?.length) * 100}
                className="h-2"
              />
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">
                  {currentQuestion?.text}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion?.options?.map((option) => (
                    <div
                      key={option.id}
                      className="border rounded-lg p-4 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {option.id.toUpperCase()}
                      </div>
                      <div>{option.text}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quiz?.questions?.length - 1
                  ? "Next"
                  : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-4 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Stady. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
