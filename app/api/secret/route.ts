import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { randomUUID } from "crypto";

/**
 * POST /api/secret
 * Stores encrypted secret data in Redis with TTL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedHex, ivHex, ttlSeconds = 86400 } = body;

    // Validate input
    if (!encryptedHex || !ivHex) {
      return NextResponse.json(
        { error: "Missing required fields: encryptedHex, ivHex" },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = randomUUID();

    // Store in Redis with TTL
    const data = {
      encryptedHex,
      ivHex,
    };

    await redis.setex(id, ttlSeconds, JSON.stringify(data));

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error storing secret:", error);
    return NextResponse.json(
      { error: "Failed to store secret" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/secret
 * Retrieves and immediately deletes secret from Redis (atomic operation)
 * CRITICAL: force-dynamic prevents caching
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    // Atomic get and delete operation
    // Using getdel which atomically gets and deletes
    const data = await redis.getdel(id);

    if (!data) {
      return NextResponse.json(
        { error: "Secret not found" },
        { status: 404 }
      );
    }

    // Parse the stored data
    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    return NextResponse.json({
      encryptedHex: parsed.encryptedHex,
      ivHex: parsed.ivHex,
    });
  } catch (error) {
    console.error("Error retrieving secret:", error);
    return NextResponse.json(
      { error: "Failed to retrieve secret" },
      { status: 500 }
    );
  }
}

