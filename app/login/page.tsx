"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { BrainCircuit } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../auth-provider"
import { toast } from "../../components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, refreshSession } = useAuth()

  // Cek apakah ada parameter error di URL
  useEffect(() => {
    const error = searchParams.get("error")
    if (error === "auth") {
      setAuthError("Sesi Anda telah berakhir. Silakan login kembali.")
      toast({
        title: "Sesi berakhir",
        description: "Sesi Anda telah berakhir. Silakan login kembali.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  // Coba refresh session saat halaman dimuat
  useEffect(() => {
    const tryRefreshSession = async () => {
      if (authError) {
        await refreshSession()
      }
    }
    tryRefreshSession()
  }, [authError, refreshSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailNotConfirmed(false)
    setAuthError(null)

    try {
      const result = await signIn(email, password)

      if (result.error) {
        if (
          result.error.includes("Email not confirmed") ||
          result.error.includes("Invalid login credentials") ||
          result.error.includes("Email not verified")
        ) {
          setEmailNotConfirmed(true)
          toast({
            title: "Email not verified",
            description: "Please verify your email before signing in.",
            variant: "destructive",
          })
        } else {
          setAuthError(result.error)
          toast({
            title: "Error signing in",
            description: result.error || "Please check your credentials and try again.",
            variant: "destructive",
          })
        }
      } else {
        // Redirect berdasarkan role pengguna
        if (result.user && result.user.role) {
          if (result.user.role === "teacher") {
            router.push("/teacher/dashboard")
          } else if (result.user.role === "student") {
            router.push("/student/join")
          } else {
            // Jika role tidak dikenali, arahkan ke halaman pemilihan role
            router.push("/role-select")
          }
        } else {
          // Jika pengguna belum memiliki role, arahkan ke halaman pemilihan role
          router.push("/role-select")
        }
      }
    } catch (error) {
      console.error("Error signing in:", error)
      setAuthError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-2">
          <img src = "/images/logo-stady2.png" alt="Logo" className="h-12 w-8 mb-4" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back!</CardTitle>
          <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {emailNotConfirmed && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Email not verified</AlertTitle>
              <AlertDescription>
                Your email address has not been verified. Please check your inbox for a verification email.
              </AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}