import type { User } from '@prisma/client'

interface CreateUserParams {
  name: string
  email: string
  password_hash: string
}

export interface UsersRepository {
  findById: (userId: string) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
  create: (data: CreateUserParams) => Promise<User>
}
