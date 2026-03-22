import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'vendor' | 'customer'
      vendorSlug?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'vendor' | 'customer'
    vendorSlug?: string
  }
}
