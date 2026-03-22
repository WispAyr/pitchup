import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Hardcoded platform admin credentials
const PLATFORM_ADMIN_EMAIL = 'admin@pitchup.local-connect.uk'
const PLATFORM_ADMIN_PASSWORD = 'PitchUpAdmin2026!'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'vendor-login',
      name: 'Vendor Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Check platform admin first
        if (
          credentials.email === PLATFORM_ADMIN_EMAIL &&
          credentials.password === PLATFORM_ADMIN_PASSWORD
        ) {
          return {
            id: 'platform-admin',
            email: PLATFORM_ADMIN_EMAIL,
            name: 'Platform Admin',
            role: 'admin',
            vendorSlug: null,
          }
        }

        const vendor = await prisma.vendor.findFirst({
          where: { email: credentials.email },
        })
        if (!vendor) return null

        const valid = await bcrypt.compare(credentials.password, vendor.passwordHash)
        if (!valid) return null

        return {
          id: vendor.id,
          email: vendor.email,
          name: vendor.name,
          role: 'vendor',
          vendorSlug: vendor.slug,
        }
      },
    }),
    CredentialsProvider({
      id: 'customer-login',
      name: 'Customer Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const customer = await prisma.customer.findFirst({
          where: { email: credentials.email },
        })
        if (!customer) return null

        const valid = await bcrypt.compare(credentials.password, customer.passwordHash)
        if (!valid) return null

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: 'customer',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.vendorSlug = (user as any).vendorSlug
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).vendorSlug = token.vendorSlug
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
