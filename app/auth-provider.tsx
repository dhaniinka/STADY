"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { setUserRoleAction, signIn, signOut, signUp } from "./actions/auth-actions"
import { useRouter, usePathname } from "next/navigation"
import {
  createClient,
  SupabaseClient,
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

// Singleton pattern for Supabase client
let supabaseInstance: SupabaseClient<any, "public", any> | null = null;

const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "stady-auth-storage", // Kunci penyimpanan yang konsisten
      detectSessionInUrl: true, // Deteksi sesi dari URL
    },
  })

  return supabaseInstance
}

const supabase = getSupabaseClient()

type UserDTO = {
  id: string
  email: string
  role: string | null
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

type AuthContextType = {
  user: UserDTO | null
  isLoading: boolean
  userRole: string | null
  signUp: (email: string, password: string) => Promise<{ user: any | null; error?: string }>
  signIn: (email: string, password: string) => Promise<{ user: any | null; error?: string }>
  signOut: () => Promise<void>
  setUserRole: (userId: string, role: "student" | "teacher") => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<boolean>
  redirectToRolePage: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fungsi untuk mengarahkan pengguna berdasarkan role
  const redirectToRolePage = () => {
    if (!user) return

    // Jika pengguna sudah memiliki role, arahkan ke halaman yang sesuai
    if (user.role === "teacher") {
      router.push("/teacher/dashboard")
    } else if (user.role === "student") {
      router.push("/student/join")
    } else {
      // Jika pengguna belum memiliki role, arahkan ke halaman pemilihan role
      router.push("/role-select")
    }
  }

  // Fungsi untuk me-refresh sesi secara manual
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
        // Jika refresh gagal, coba sign out dan redirect ke login
        if (error.message.includes("refresh_token_not_found")) {
          await handleSignOut()
          router.push("/login")
        }
        return false
      }
      return true
    } catch (error) {
      console.error("Error in refreshSession:", error)
      return false
    }
  }

  // Fungsi untuk mendapatkan profil pengguna
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      return { profile, error: profileError }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return { profile: null, error }
    }
  }

  // Efek untuk mengarahkan pengguna berdasarkan role saat aplikasi dimuat
  useEffect(() => {
    if (!isLoading && user && user.role) {
      // Daftar halaman publik yang tidak perlu redirect
      const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

      // Jika pengguna berada di halaman publik, biarkan saja
      if (publicPages.includes(pathname)) {
        return
      }

      // Jika pengguna berada di halaman role-select, biarkan saja
      if (pathname === "/role-select") {
        return
      }

      // Jika pengguna adalah teacher tapi berada di halaman student, redirect ke dashboard teacher
      if (user.role === "teacher" && pathname.startsWith("/student")) {
        router.push("/teacher/dashboard")
        return
      }

      // Jika pengguna adalah student tapi berada di halaman teacher, redirect ke halaman join student
      if (user.role === "student" && pathname.startsWith("/teacher")) {
        router.push("/student/join")
        return
      }
    }
  }, [isLoading, user, pathname, router])

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          // Jika error adalah refresh_token_not_found, coba sign out
          if (error.message && error.message.includes("refresh_token_not_found")) {
            console.warn("Refresh token not found, signing out...")
            await handleSignOut()
          } else {
            console.error("Error fetching session:", error)
          }
          setUser(null)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // Get user profile with role
          const { profile, error: profileError } = await fetchUserProfile(session.user.id)

          if (profileError) {
            console.error("Error fetching user profile:", profileError)
          } else if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: profile?.role || null,
              displayName: profile?.display_name || session.user.email?.split("@")[0] || null,
              avatarUrl: profile?.avatar_url || null,
              createdAt: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString(),
              updatedAt: profile?.updated_at ? new Date(profile.updated_at).toISOString() : new Date().toISOString(),
            })
          } else {
            // No profile found, might be a new user
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: null,
              displayName: session.user.email?.split("@")[0] || null,
              avatarUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in getSession:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setIsLoading(false)
        return
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      }

      if (session?.user) {
        // Get user profile with role
        const { profile, error: profileError } = await fetchUserProfile(session.user.id)

        if (profileError) {
          console.error("Error fetching user profile on auth change:", profileError)
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: null,
            displayName: session.user.email?.split("@")[0] || null,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        } else if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: profile?.role || null,
            displayName: profile?.display_name || session.user.email?.split("@")[0] || null,
            avatarUrl: profile?.avatar_url || null,
            createdAt: profile?.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString(),
            updatedAt: profile?.updated_at ? new Date(profile.updated_at).toISOString() : new Date().toISOString(),
          })
        } else {
          // No profile found, might be a new user
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: null,
            displayName: session.user.email?.split("@")[0] || null,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignUp = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      const result = await signUp(formData)
      return result
    } catch (error) {
    console.error("Error in handleSignUp:", error);
  
    let message = "Failed to sign up";
    if (error instanceof Error) {
    message = error.message;
    }

  return { user: null, error: message };
}
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      const result = await signIn(formData)
      return result
    } catch (error) {
    console.error("Error in handleSignIn:", error);
  
    let message = "Failed to sign in";
    if (error instanceof Error) {
    message = error.message;
   }

  return { user: null, error: message };
}
  }

  const handleSignOut = async () => {
    try {
      await signOut()

      // Clear any local storage or session storage
      sessionStorage.clear()

      // Hapus cookie auth secara manual
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Reset state
      setUser(null)

      // Redirect to home page after sign out
      router.push("/")
    } catch (error) {
      console.error("Error in handleSignOut:", error)
    }
  }

  const handleSetUserRole = async (userId: string, role: "student" | "teacher") => {
    try {
      const result = await setUserRoleAction(userId, role)

      if (result.success && user) {
        // Update local user state with new role
        setUser({
          ...user,
          role: role,
        })

        // Redirect ke halaman yang sesuai dengan role
        if (role === "teacher") {
          router.push("/teacher/dashboard")
        } else if (role === "student") {
          router.push("/student/join")
        }
      }

      return result
    } catch (error) {
      console.error("Error in handleSetUserRole:", error)
      return { success: false, error: error.message || "Failed to set user role" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userRole: user?.role || null,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        setUserRole: handleSetUserRole,
        refreshSession,
        redirectToRolePage,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
