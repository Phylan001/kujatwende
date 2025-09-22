import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "user" } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password,
      role: role as "user" | "admin",
    })

    // Generate token
    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
