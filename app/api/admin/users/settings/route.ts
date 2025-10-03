import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const currentUser = verifyToken(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (body.email !== currentUser.email) {
      const existingUser = await db.collection("users").findOne({
        email: body.email,
        _id: { $ne: new ObjectId(currentUser.id) },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Build update object with only changed fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided and not empty
    if (body.name && body.name.trim() !== "") {
      updateData.name = body.name.trim();
    }

    if (body.email && body.email.trim() !== "") {
      updateData.email = body.email.trim();
    }

    // Phone can be empty string (user wants to remove phone)
    if (body.phone !== undefined) {
      updateData.phone = body.phone.trim();
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(currentUser.id) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No changes made" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updateData.name || currentUser.name,
        email: updateData.email || currentUser.email,
        phone:
          updateData.phone !== undefined ? updateData.phone : currentUser.phone,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
