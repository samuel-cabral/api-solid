import { randomUUID } from 'node:crypto'

import type { CheckIn, Prisma } from '@prisma/client'

import type { CheckInsRepository } from '../check-ins-repository'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfTheDay = new Date(date)
    startOfTheDay.setHours(0, 0, 0, 0)
    const endOfTheDay = new Date(date)
    endOfTheDay.setHours(23, 59, 59, 999)

    const checkIn = this.items.find(
      (item) =>
        item.user_id === userId &&
        new Date(item.createdAt) >= startOfTheDay &&
        new Date(item.createdAt) <= endOfTheDay,
    )

    return Promise.resolve(checkIn || null)
  }

  public items: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
    }

    this.items.push(checkIn)

    return checkIn
  }
}
