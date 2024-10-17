import { compare } from 'bcryptjs'
import { describe, expect, it } from 'vitest'

import { RegisterUseCase } from './register'

describe('Register use case', () => {
  it('should hash user password upon registration', async () => {
    const registerUseCase = new RegisterUseCase({
      async findByEmail() {
        return null
      },
      async create(data) {
        return {
          id: 'user-1',
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
    })

    const { user } = await registerUseCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const isPasswordCorrectlyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })
})
