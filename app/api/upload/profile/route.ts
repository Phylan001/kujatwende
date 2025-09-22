import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB limit for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get current user to check for existing profile picture
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete old profile picture if exists
    if (user.profilePicture?.public_id) {
      await deleteFromCloudinary(user.profilePicture.public_id)
    }

    // Upload new profile picture
    const result = await uploadToCloudinary(file, `kuja-twende/profiles/${decoded.userId}`)

    // Update user profile with new image
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          profilePicture: {
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
          },
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Profile upload error:", error)
    return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 })
  }
}
