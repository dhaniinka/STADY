import type { UserRepository } from "../interfaces/repositories/user-repository"
import { BaseRepository } from "./base-repository"
import { User, type UserRole } from "../models/user"

export class SupabaseUserRepository extends BaseRepository<User> implements UserRepository {
  constructor() {
    super("profiles")
  }

  mapToEntity(data: any): User {
    return User.fromJSON(data)
  }

  mapToDatabase(entity: User): Record<string, any> {
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role,
      display_name: entity.displayName,
      avatar_url: entity.avatarUrl,
      updated_at: new Date().toISOString(),
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("email", email).single()

    if (error || !data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("role", role)

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async setUserRole(userId: string, role: UserRole): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error || !data) {
      return null
    }

    return this.mapToEntity(data)
  }
}
