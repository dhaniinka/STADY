"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { BrainCircuit, GraduationCap, UserCog } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth-provider"
import { useState, useEffect } from "react"
import { toast } from "../../components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"

export default function RoleSelectPage() {
  const router = useRouter()
  const { user, setUserRole, userRole, isLoading } = useAuth()
  const [isSettingRole, setIsSettingRole] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect jika user sudah memiliki role
  useEffect(() => {
    if (!isLoading) {
      if (userRole === "student") {
        router.push("/student/join")
      } else if (userRole === "teacher") {
        router.push("/teacher/dashboard")
      }
    }
  }, [userRole, isLoading, router])

  const handleRoleSelect = async (role: "student" | "teacher") => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to continue",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsSettingRole(true)
    setError(null)

    try {
      await setUserRole(user.id, role)

      toast({
        title: "Role set successfully",
        description: `You are now registered as a ${role}`,
      })

      // Redirect akan ditangani oleh setUserRole
    } catch (error) {
      console.error("Error setting user role:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "There was a problem setting your role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSettingRole(false)
    }
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Jika pengguna sudah memiliki role, tampilkan loading saja karena akan segera redirect
  if (userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to your dashboard...</p>
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
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to STADY!</h1>
            <p className="text-muted-foreground">Choose how you want to use Stady today</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="quiz-card overflow-hidden">
              <CardHeader className="bg-primary text-white">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  I&apos;m a Student
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Join quizzes and test your knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-6 text-muted-foreground">
                  Enter a quiz code to join a session and participate in interactive quizzes created by your teachers.
                </p>
                <Button className="w-full" onClick={() => handleRoleSelect("student")} disabled={isSettingRole}>
                  {isSettingRole ? "Setting role..." : "Continue as Student"}
                </Button>
              </CardContent>
            </Card>

            <Card className="quiz-card overflow-hidden">
              <CardHeader className="bg-secondary text-white">
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-6 w-6" />
                  I&apos;m a Teacher
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80">Create and manage quizzes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-6 text-muted-foreground">
                  Create engaging quizzes, manage your library, and track student performance with detailed analytics.
                </p>
                <Button
                  className="w-full bg-secondary hover:bg-secondary/90"
                  onClick={() => handleRoleSelect("teacher")}
                  disabled={isSettingRole}
                >
                  {isSettingRole ? "Setting role..." : "Continue as Teacher"}
                </Button>
              </CardContent>
            </Card>
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