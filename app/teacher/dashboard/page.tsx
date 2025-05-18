"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { BrainCircuit, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { useAuth } from "../../../app/auth-provider"
import { getTeacherQuizzes } from "../../../app/actions/quiz-actions"
import { toast } from "../../../components/ui/use-toast"

type Quiz = {
  id: string
  title: string
  code: string
  created_at: string
  questions: any[]
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, userRole, isLoading: authLoading, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if user is not a teacher
  useEffect(() => {
    if (!authLoading && userRole && userRole !== "teacher") {
      router.push("/role-select")
    }
  }, [userRole, authLoading, router])

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const result = await getTeacherQuizzes(user.id)

        if (result.success && result.data) {
        setQuizzes(result.data);
        } else {
          throw new Error("Failed to fetch quizzes")
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        toast({
          title: "Error",
          description: "There was a problem fetching your quizzes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchQuizzes()
    }
  }, [user])

  const filteredQuizzes = quizzes.filter((quiz) => quiz.title.toLowerCase().includes(searchQuery.toLowerCase()))

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
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-1" />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/role-select">
            <Button variant="outline" size="sm">
              Change Role
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Manage your quizzes and view student performance</p>
            </div>
            <Button onClick={() => router.push("/teacher/create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Quiz
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="my-library">
            <TabsList className="mb-6">
              <TabsTrigger value="my-library">My Library</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="my-library" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your quizzes...</p>
                </div>
              ) : filteredQuizzes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="quiz-card">
                      <CardHeader className="pb-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>{quiz.questions?.length || 0} questions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div>Created: {new Date(quiz.created_at).toLocaleDateString()}</div>
                          <div>Code: {quiz.code}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/teacher/edit/${quiz.id}`)}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => router.push(`/teacher/present/${quiz.id}`)}>
                          Present
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No quizzes found</p>
                  <Button onClick={() => router.push("/teacher/create")}>Create Your First Quiz</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              <div className="text-center py-12 text-muted-foreground">
                Your recently accessed quizzes will appear here
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="text-center py-12 text-muted-foreground">Your favorite quizzes will appear here</div>
            </TabsContent>
          </Tabs>
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