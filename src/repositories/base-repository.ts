import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Repository } from "../interfaces/repositories/repository"
import type { Entity } from "../models/base/entity"

export abstract class BaseRepository<T extends Entity<string>> implements Repository<T> {
  protected supabase: SupabaseClient
  protected tableName: string

  constructor(tableName: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    this.tableName = tableName
  }

  abstract mapToEntity(data: any): T
  abstract mapToDatabase(entity: T): Record<string, any>

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("id", id).single()

    if (error || !data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findAll(): Promise<T[]> {
    const { data, error } = await this.supabase.from(this.tableName).select("*")

    if (error || !data) {
      return []
    }

    return data.map((item) => this.mapToEntity(item))
  }

  async create(entity: T): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert([this.mapToDatabase(entity)])
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create entity: ${error?.message}`)
    }

    return this.mapToEntity(data)
  }

  async update(entity: T): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(this.mapToDatabase(entity))
      .eq("id", entity.id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update entity: ${error?.message}`)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.from(this.tableName).delete().eq("id", id)

    return !error
  }
}
