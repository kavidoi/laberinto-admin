import { UserRole } from "@prisma/client"
import type { User } from "next-auth"
import type { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
} 