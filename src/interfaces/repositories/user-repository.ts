import type { Repository } from "./repository"
import type { User, UserRole } from "../../models/user"

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>
  findByRole(role: UserRole): Promise<User[]>
  setUserRole(userId: string, role: UserRole): Promise<User | null>
}
