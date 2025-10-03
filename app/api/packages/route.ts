// app/api/packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { TravelPackage } from "@/lib/models/Package";
