import NextAuth, { Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { verifyPassword } from '@/lib/auth'

const prismaClient = new PrismaClient()
export const prisma = prismaClient as PrismaClient

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isValid = await verifyPassword(credentials.password, user.hashedPassword)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id.toString(),
          email: user.email
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.email = token.email
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Add this to handle errors
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }