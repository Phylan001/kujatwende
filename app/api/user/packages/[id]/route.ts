import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid package ID" },
        { status: 400 }
      );
    }

    const packageData = await db
      .collection("packages")
      .findOne({ _id: new ObjectId(params.id) });

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}