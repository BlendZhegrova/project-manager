import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { ApiResponse } from '@/lib/api-responses'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return ApiResponse.badRequest('Email and password required')
    }

    if (!EMAIL_REGEX.test(email)) {
      return ApiResponse.badRequest('Invalid email format')
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return ApiResponse.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return ApiResponse.conflict('Email already exists')
    }

    const hashedPassword = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword
      }
    })

    return ApiResponse.created({
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return ApiResponse.serverError(error)
  }
}
