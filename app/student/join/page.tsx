"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../app/auth-provider";
import { getQuizByCode } from "../../../app/actions/quiz-actions";
import { joinQuizSession } from "../../../app/actions/session-action";
import { toast } from "../../../components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";

export default function JoinQuizPage() {
  const [quizCode, setQuizCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, userRole, isLoading } = useAuth();

  // Redirect if user is not a student
  useEffect(() => {
    if (!isLoading && userRole && userRole !== "student") {
      router.push("/role-select");
    }
  }, [userRole, isLoading, router]);

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to join a quiz",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!quizCode.trim()) {
      toast({
        title: "Missing code",
        description: "Please enter a quiz code",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      console.log("Attempting to join quiz with code:", quizCode.trim());

      // Step 1: Get quiz by code
      const quizResult = await getQuizByCode(quizCode.trim());
      console.log("Quiz result:", quizResult);

      if (!quizResult.success || !quizResult.data) {
        setError(
          quizResult.error ||
            "The quiz code you entered doesn't exist. Please check and try again."
        );
        toast({
          title: "Invalid code",
          description:
            quizResult.error ||
            "The quiz code you entered doesn't exist. Please check and try again.",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }

      // Step 2: Join quiz session
      const joinResult = await joinQuizSession(quizResult.data.id, user.id);
      console.log("Join result:", joinResult);

      if (!joinResult.success) {
        setError(
          joinResult.error || "Failed to join the quiz. Please try again."
        );
        toast({
          title: "Error joining quiz",
          description:
            joinResult.error || "Failed to join the quiz. Please try again.",
          variant: "destructive",
        });
        setIsJoining(false);
        return;
      }

      // Store the quiz data for use in the quiz page
      sessionStorage.setItem("currentQuizId", quizResult.data.id);
      sessionStorage.setItem(
        "currentQuizData",
        JSON.stringify(quizResult.data)
      );
      if (joinResult.sessionId) {
        sessionStorage.setItem("currentSessionId", joinResult.sessionId);
      }

      // Navigate to the quiz page
      router.push(`/student/quiz/${quizCode.trim()}`);
    } catch (error) {
      console.error("Error joining quiz:", error);
      setError("There was a problem joining the quiz. Please try again.");
      toast({
        title: "Error",
        description: "There was a problem joining the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-2" />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/role-select">
            <Button variant="outline" size="sm">
              Change Role
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/student/history")}
          >
            My History
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join a Quiz</CardTitle>
            <CardDescription>
              Enter the quiz code provided by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleJoinQuiz} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="quiz-code"
                  placeholder="Enter quiz code"
                  className="text-center text-xl py-6"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isJoining || !quizCode.trim()}
              >
                {isJoining ? "Joining..." : "Join Quiz"}
              </Button>
            </form>
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