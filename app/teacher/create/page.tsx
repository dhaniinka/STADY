"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { BrainCircuit, Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useAuth } from "../../../app/auth-provider"
import { toast } from "../../../components/ui/use-toast"
import { createQuiz } from "../../../app/actions/quiz-actions"

type Question = {
  id: string
  text: string
  options: { id: string; text: string }[]
  correctAnswer: string
  timeLimit: number
}

export default function CreateQuizPage() {
  const router = useRouter()
  const { user, userRole, isLoading: authLoading } = useAuth()
  const [quizTitle, setQuizTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "a",
      timeLimit: 30,
    },
  ])

  // Redirect if user is not a teacher
  useEffect(() => {
    if (!authLoading && userRole && userRole !== "teacher") {
      router.push("/role-select")
    }
  }, [userRole, authLoading, router])

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const handleOptionChange = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
            }
          : q,
      ),
    )
  }

  const handleCorrectAnswerChange = (questionId: string, value: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q)))
  }

  const handleTimeLimitChange = (questionId: string, value: number) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, timeLimit: value } : q)))
  }

  const addQuestion = () => {
    const newId = `q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: newId,
        text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctAnswer: "a",
        timeLimit: 30,
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your quiz",
        variant: "destructive",
      })
      return false
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        toast({
          title: "Incomplete question",
          description: "Please fill in all question texts",
          variant: "destructive",
        })
        return false
      }

      for (const option of question.options) {
        if (!option.text.trim()) {
          toast({
            title: "Incomplete options",
            description: `Please fill in all options for question ${question.id.replace("q", "")}`,
            variant: "destructive",
          })
          return false
        }
      }
    }

    return true
  }

  const handleSaveQuiz = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to create a quiz",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!validateQuiz()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", quizTitle)
      formData.append("teacherId", user.id)
      formData.append("questions", JSON.stringify(questions))

      const result = await createQuiz(formData)

      if (result.success) {
        toast({
          title: "Quiz created",
          description: `Quiz code: ${result.code}`,
        })
        router.push("/teacher/dashboard")
      } else {
        throw new Error("Failed to create quiz")
      }
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast({
        title: "Error",
        description: "There was a problem creating your quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-2" />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/teacher/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button size="sm" onClick={handleSaveQuiz} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      placeholder="Enter quiz title"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="relative">
                <CardContent className="pt-6">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(question.id)}
                      disabled={questions.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor={`question-${question.id}`}>Question {index + 1}</Label>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`time-limit-${question.id}`} className="text-sm">
                            Time Limit:
                          </Label>
                          <Select
                            value={question.timeLimit.toString()}
                            onValueChange={(value) => handleTimeLimitChange(question.id, Number.parseInt(value))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 sec</SelectItem>
                              <SelectItem value="20">20 sec</SelectItem>
                              <SelectItem value="30">30 sec</SelectItem>
                              <SelectItem value="60">60 sec</SelectItem>
                              <SelectItem value="90">90 sec</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Textarea
                        id={`question-${question.id}`}
                        placeholder="Enter your question"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                        className="mb-4"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {option.id.toUpperCase()}
                            </div>
                            <Input
                              placeholder={`Option ${option.id.toUpperCase()}`}
                              value={option.text}
                              onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor={`correct-answer-${question.id}`}>Correct Answer</Label>
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) => handleCorrectAnswerChange(question.id, value)}
                      >
                        <SelectTrigger id={`correct-answer-${question.id}`}>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">Option A</SelectItem>
                          <SelectItem value="b">Option B</SelectItem>
                          <SelectItem value="c">Option C</SelectItem>
                          <SelectItem value="d">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full py-6 border-dashed" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={handleSaveQuiz} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Stady. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}