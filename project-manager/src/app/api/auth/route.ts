// src/app/api/auth/route.ts
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/api-responses'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server';

// Validation constants
const MIN_PASSWORD_LENGTH = 8
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json()

    if (!email || !password || !action) {
      return ApiResponse.badRequest('Email, password and action are required')
    }

    if (!EMAIL_REGEX.test(email)) {
      return ApiResponse.badRequest('Please provide a valid email address')
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return ApiResponse.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    if (action === 'register') {
      return handleRegistration(email, password)
    }

    if (action === 'login') {
      return handleLogin(email, password)
    }

    return ApiResponse.badRequest('Invalid action - must be "register" or "login"')
  } catch (error) {
    console.error('Auth error:', error)
    return ApiResponse.serverError(error)
  }
}

async function handleRegistration(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return ApiResponse.conflict('Email already exists')
  }

  const hashedPassword = hashPassword(password)
  const user = await prisma.user.create({
    data: { email, hashedPassword }
  })

  const token = generateToken(user.id)
  ;(await cookies()).set('token', token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 1 day
  })

  return ApiResponse.created({
    user: { 
      id: user.id, 
      email: user.email 
    },
    token 
  })
}

async function handleLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return ApiResponse.unauthorized();
  }

  const passwordValid = verifyPassword(password, user.hashedPassword)
  if (!passwordValid) {
    return ApiResponse.unauthorized();
  }

  const token = generateToken(user.id)
  ;(await cookies()).set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 1 day
  })

  return ApiResponse.success({
    user: { 
      id: user.id, 
      email: user.email 
    }
  })
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = cookies();
    
    (await cookieStore).delete('token');
    
    return ApiResponse.success({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return ApiResponse.serverError(error);
  }
}