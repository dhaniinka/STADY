"use server"

import { ServiceFactory } from "../../src/factories/service-factory"
import type { UserRole } from "../../src/models/user"
import { userToDTO } from "../../src/adapters/user-adapter"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const authService = ServiceFactory.getAuthService()
  const result = await authService.signUp(email, password)

  return {
    user: userToDTO(result.user),
    error: result.error,
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const authService = ServiceFactory.getAuthService()
  const result = await authService.signIn(email, password)

  return {
    user: userToDTO(result.user),
    error: result.error,
  }
}

export async function signOut() {
  const authService = ServiceFactory.getAuthService()
  const result = await authService.signOut()

  return result
}

export async function setUserRoleAction(userId: string, role: "student" | "teacher", email?: string) {
  const authService = ServiceFactory.getAuthService()
  const result = await authService.setUserRole(userId, role as UserRole)

  return result
}

export async function resetPassword(email: string) {
  const authService = ServiceFactory.getAuthService()
  const result = await authService.resetPassword(email)

  return result
}

export async function updatePassword(password: string) {
  const authService = ServiceFactory.getAuthService()
  const result = await authService.updatePassword(password)

  return result
}