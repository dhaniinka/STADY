"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { BrainCircuit, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Progress } from "../../../../components/ui/progress";
import { getQuizByCode } from "../../../actions/quiz-actions";
import { useAuth } from "../../../auth-provider";
import { toast } from "../../../../components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const quizCode = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if user is not a student
  useEffect(() => {
    if (!authLoading && userRole && userRole !== "student") {
      router.push("/role-select");
    }
  }, [userRole, authLoading, router]);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to take a quiz",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Try to get quiz data from session storage first (set during join)
    const storedQuizData = sessionStorage.getItem("currentQuizData");

    if (storedQuizData) {
      try {
        const parsedData = JSON.parse(storedQuizData);
        if (parsedData && parsedData.code === quizCode) {
          console.log("Using stored quiz data:", parsedData);
          setQuiz(parsedData);
          setTimeLeft(parsedData.questions[0]?.timeLimit || 30);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored quiz data:", e);
      }
    }

    // If no valid data in session storage, verify the code with the server
    const verifyQuizCode = async () => {
      try {
        console.log("Verifying quiz code:", quizCode);
        const result = await getQuizByCode(quizCode);
        console.log("Quiz verification result:", result);

        if (result.success && result.data) {
          setQuiz(result.data);
          setTimeLeft(result.data.questions[0]?.timeLimit || 30);
          // Store for future reference
          sessionStorage.setItem("currentQuizId", result.data.id);
          sessionStorage.setItem(
            "currentQuizData",
            JSON.stringify(result.data)
          );
        } else {
          setError("This quiz doesn't exist or has been removed.");
          toast({
            title: "Invalid quiz code",
            description: "This quiz doesn't exist or has been removed.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error verifying quiz code:", error);
        setError("There was a problem loading the quiz. Please try again.");
        toast({
          title: "Error",
          description:
            "There was a problem loading the quiz. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyQuizCode();
  }, [quizCode, router, user]);

  // Set up timer for current question
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // If quiz is completed or not loaded yet, don't start a new timer
    if (quizCompleted || !quiz || isLoading) {
      return;
    }

    // Set up the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          timerRef.current = null;
          if (!isAnswered) {
            setTimeout(() => {
              handleNextQuestion();
            }, 0);
          }
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to clear the timer when the component unmounts or the dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestionIndex, isAnswered, quizCompleted, quiz, isLoading]);

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOption(optionId);
    setIsAnswered(true);

    if (optionId === quiz.questions[currentQuestionIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(quiz.questions[currentQuestionIndex + 1]?.timeLimit || 30);
    } else {
      setQuizCompleted(true);
      // Save quiz results to session storage
      const results = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date().toISOString(),
      };

      // Get existing results or initialize empty array
      const existingResults = JSON.parse(
        sessionStorage.getItem("quizResults") || "[]"
      );
      existingResults.push(results);
      sessionStorage.setItem("quizResults", JSON.stringify(existingResults));
    }
  };

  // Show loading state while checking auth or loading quiz
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-2" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button onClick={() => router.push("/student/join")}>
                  Back to Join Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
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

  // If no quiz found after loading, redirect to join page
  if (!quiz) {
    router.push("/student/join");
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-2" />
        </div>
        <div className="text-sm font-medium">Quiz Code: {quizCode}</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        {!quizCompleted ? (
          <div className="w-full max-w-3xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  {timeLeft}s
                </div>
              </div>
              <Progress
                value={(currentQuestionIndex / quiz.questions.length) * 100}
                className="h-2"
              />
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">
                  {currentQuestion.text}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => {
                    const isCorrect =
                      isAnswered && option.id === currentQuestion.correctAnswer;
                    const isIncorrect =
                      isAnswered &&
                      selectedOption === option.id &&
                      option.id !== currentQuestion.correctAnswer;

                    return (
                      <Button
                        key={option.id}
                        variant={
                          selectedOption === option.id ? "default" : "outline"
                        }
                        className={`h-auto py-6 px-4 justify-start text-lg font-normal relative ${
                          isCorrect
                            ? "bg-green-500 hover:bg-green-500 text-white"
                            : ""
                        } ${
                          isIncorrect
                            ? "bg-red-500 hover:bg-red-500 text-white"
                            : ""
                        }`}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={isAnswered}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {option.id.toUpperCase()}
                          </div>
                          <div>{option.text}</div>
                        </div>

                        {isCorrect && (
                          <CheckCircle className="absolute right-4 h-6 w-6" />
                        )}
                        {isIncorrect && (
                          <XCircle className="absolute right-4 h-6 w-6" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <div className="mb-4 mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                <BrainCircuit className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-muted-foreground mb-6">
                You scored {score} out of {quiz.questions.length}
              </p>
              <div className="mb-8">
                <div className="text-5xl font-bold text-primary">
                  {Math.round((score / quiz.questions.length) * 100)}%
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/student/join")}>
                  Join Another Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
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