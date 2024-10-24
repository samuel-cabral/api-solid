import { hash } from 'bcryptjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

import { CheckInUseCase } from './check-in'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

let usersRepository: InMemoryUsersRepository
let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    gymsRepository = new InMemoryGymsRepository()
    checkInsRepository = new InMemoryCheckInsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    vi.setSystemTime(new Date(2024, 9, 20, 8, 0, 0))

    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const createdGym = await gymsRepository.create({
      title: 'JavaScript Gym',
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    })

    const { checkIn } = await sut.execute({
      gymId: createdGym.id,
      userId: createdUser.id,
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
      validatedAt: new Date(),
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2024, 9, 20, 8, 0, 0))

    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const createdGym = await gymsRepository.create({
      title: 'JavaScript Gym',
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    })

    await checkInsRepository.create({
      gym_id: createdGym.id,
      user_id: createdUser.id,
    })

    await expect(() =>
      sut.execute({
        gymId: createdGym.id,
        userId: createdUser.id,
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
        validatedAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2024, 9, 19, 8, 0, 0))

    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const createdGym = await gymsRepository.create({
      title: 'JavaScript Gym',
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.6401091,
    })

    await sut.execute({
      gymId: createdGym.id,
      userId: createdUser.id,
      userLatitude: -27.2092052,
      userLongitude: -49.6401091,
      validatedAt: new Date(),
    })

    vi.setSystemTime(new Date(2024, 9, 20, 8, 0, 0))

    await expect(
      sut.execute({
        gymId: createdGym.id,
        userId: createdUser.id,
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
        validatedAt: new Date(),
      }),
    ).resolves.not.toThrow()
  })
})
