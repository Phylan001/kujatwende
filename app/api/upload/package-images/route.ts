import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (!decoded.userId || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const packageId = formData.get("packageId") as string

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!packageId) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 })
    }

    const uploadResults = []

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue // Skip non-image files
      }

      if (file.size > 10 * 1024 * 1024) {
        continue // Skip files larger than 10MB
      }

      try {
        const result = await uploadToCloudinary(file, `kuja-twende/packages/${packageId}`)
        uploadResults.push(result)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: uploadResults,
      uploaded: uploadResults.length,
      total: files.length,
    })
  } catch (error) {
    console.error("Package images upload error:", error)
    return NextResponse.json({ error: "Failed to upload package images" }, { status: 500 })
  }
}
