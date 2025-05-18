import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { AuthService } from "../interfaces/services/auth-service"
import { User, type UserRole } from "../models/user"
import type { UserRepository } from "../interfaces/repositories/user-repository"

export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
    this.userRepository = userRepository
  }

  async signUp(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            redirect_to: "/role-select",
          },
        },
      })

      if (error) throw error

      if (!data.user) {
        return { user: null, error: "No user returned from sign up" }
      }

      return { user: User.fromJSON({ ...data.user, role: null }) }
    } catch (error) {
      console.error("Error signing up:", error)
      return { user: null, error: error instanceof Error ? error.message : "Failed to sign up" }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.user) {
        return { user: null, error: "No user returned from sign in" }
      }

      // Get user profile with role
      const userProfile = await this.userRepository.findById(data.user.id)

      return { user: userProfile }
    } catch (error) {
      console.error("Error signing in:", error)
      return { user: null, error: error instanceof Error ? error.message : "Failed to sign in" }
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) throw error

      return {}
    } catch (error) {
      console.error("Error signing out:", error)
      return { error: error instanceof Error ? error.message : "Failed to sign out" }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      // Get user profile with role
      const userProfile = await this.userRepository.findById(user.id)

      return userProfile
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.userRepository.findById(userId)

      if (!user) {
        // User doesn't exist in profiles table, create a new profile
        const {
          data: { user: authUser },
        } = await this.supabase.auth.getUser()

        if (!authUser) {
          return { success: false, error: "User not found in auth system" }
        }

        const newUser = new User(
          userId,
          authUser.email ?? "",
          role,
          authUser.user_metadata?.name || null,
          authUser.user_metadata?.avatar_url || null,
        )

        await this.userRepository.create(newUser)
      } else {
        // Update existing user role
        await this.userRepository.setUserRole(userId, role)
      }

      return { success: true }
    } catch (error) {
      console.error("Error setting user role:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to set user role" }
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/reset-password`

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error resetting password:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to reset password" }
    }
  }

  async updatePassword(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error updating password:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to update password" }
    }
  }
}
