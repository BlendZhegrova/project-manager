import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      task: {
        async validateStatus(status: string) {
          const valid = ['todo', 'in-progress', 'done']
          if (!valid.includes(status)) {
            throw new Error(`Invalid status: ${status}`)
          }
        }
      }
    }
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma