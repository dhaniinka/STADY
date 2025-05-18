import type { User, UserRole } from "../../models/user"

export interface AuthService {
  signUp(email: string, password: string): Promise<{ user: User | null; error?: string }>
  signIn(email: string, password: string): Promise<{ user: User | null; error?: string }>
  signOut(): Promise<{ error?: string }>
  getCurrentUser(): Promise<User | null>
  setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }>
  resetPassword(email: string): Promise<{ success: boolean; error?: string }>
  updatePassword(password: string): Promise<{ success: boolean; error?: string }>
}
