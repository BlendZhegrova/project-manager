import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret' // Fallback for dev

// Simplified hash function (no need for async in dev)
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

// Simplified verify function
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// Rest remains the same
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '8h' }) // Shorter expiry for dev
}

export function verifyToken(token: string): { userId: number } {
  return jwt.verify(token, JWT_SECRET) as { userId: number }
}

export async function getCurrentUser() {
  const token = (await cookies()).get('token')?.value
  if (!token) return null
  
  try {
    const { userId } = verifyToken(token)
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })
  } catch {
    return null
  }
}