import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import type { User, UserSession } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: UserSession): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch {
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  const db = await getDatabase()
  const hashedPassword = await hashPassword(userData.password)

  const user: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection("users").insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase()
  return db.collection<User>("users").findOne({ email })
}
