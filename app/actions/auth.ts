"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function register(formData: FormData) {
  try {
    const data = registerSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    // Check if user already exists with any provider
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { accounts: true }
    })

    if (existingUser) {
      const hasOAuthAccount = existingUser.accounts.some(acc => acc.provider !== "credentials")
      const hasCredentialsAccount = existingUser.accounts.some(acc => acc.provider === "credentials")

      if (hasCredentialsAccount) {
        return { success: false, error: "User with this email already exists. Please sign in instead." }
      }
      
      if (hasOAuthAccount) {
        return { success: false, error: "This email is already registered with an OAuth provider. Please use that provider to sign in." }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user with Account record (for foreign key relationship)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: data.email, // Use email as providerAccountId for credentials
          },
        },
      },
      include: {
        accounts: true,
      },
    })

    return { success: true, message: "Account created successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to create account" }
  }
}

