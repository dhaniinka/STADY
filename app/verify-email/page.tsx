"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { BrainCircuit, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "../../lib/supabase-client"

// Gunakan singleton client
const supabase = getSupabaseClient()

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Cek apakah ada token di URL
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")
        const next = searchParams.get("next") || "/login"

        if (!token_hash) {
          // Jika tidak ada token, mungkin pengguna mengakses halaman secara langsung
          // Kita cek apakah pengguna sudah terautentikasi
          const { data: sessionData } = await supabase.auth.getSession()

          if (sessionData?.session) {
            // Jika pengguna sudah login, kita anggap email sudah terverifikasi
            setVerificationStatus("success")
            return
          } else {
            setErrorMessage("Token verifikasi tidak ditemukan di URL")
            setVerificationStatus("error")
            return
          }
        }

        if (token_hash && type) {
          // Verifikasi token
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            console.error("Error verifying email:", error)
            setErrorMessage(error.message)
            setVerificationStatus("error")
            return
          }

          setVerificationStatus("success")

          // Redirect ke login setelah 3 detik
          setTimeout(() => {
            router.push(next)
          }, 3000)
        } else {
          setErrorMessage("Parameter verifikasi tidak lengkap")
          setVerificationStatus("error")
        }
      } catch (error) {
        console.error("Error verifying email:", error)
        setErrorMessage("Terjadi kesalahan saat memverifikasi email")
        setVerificationStatus("error")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary">QuizWiz</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verifikasi Email</CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === "loading" && "Memverifikasi email Anda..."}
            {verificationStatus === "success" && "Email Anda berhasil diverifikasi!"}
            {verificationStatus === "error" && "Gagal memverifikasi email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-6">
          {verificationStatus === "loading" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          )}

          {verificationStatus === "success" && (
            <div className="text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="mb-4">Email Anda telah berhasil diverifikasi.</p>
              <p className="text-sm text-muted-foreground">
                Anda akan dialihkan ke halaman login dalam beberapa detik.
              </p>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="text-center">
              <div className="mx-auto bg-red-100 dark:bg-red-900 p-3 rounded-full w-fit mb-4">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="mb-4">Gagal memverifikasi email Anda.</p>
              <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              <Button asChild>
                <Link href="/login">Kembali ke Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {verificationStatus !== "error" && (
            <div className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Kembali ke login
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}