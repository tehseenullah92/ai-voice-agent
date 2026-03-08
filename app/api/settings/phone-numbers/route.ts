import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../../lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const numbers = await prisma.phoneNumber.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      phoneNumbers: numbers.map((n) => {
        let capabilities: Record<string, boolean> = {};
        if (n.capabilities) {
          try {
            capabilities = JSON.parse(n.capabilities) as Record<string, boolean>;
          } catch {
            // ignore
          }
        }
        return {
          id: n.id,
          phoneNumber: n.phoneNumber,
          phoneNumberSid: n.phoneNumberSid,
          friendlyName: n.friendlyName,
          label: n.label,
          capabilities,
        };
      }),
    });
  } catch (err) {
    console.error("GET /api/settings/phone-numbers error", err);
    return NextResponse.json(
      { error: "Failed to load phone numbers" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const body = await req.json();
    const { id, label } = body as { id?: string; label?: string };

    if (!id) {
      return NextResponse.json(
        { error: "Phone number id is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.phoneNumber.updateMany({
      where: { id, userId: user.id },
      data: { label: label ?? null },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Phone number not found" }, { status: 404 });
    }

    const num = await prisma.phoneNumber.findFirst({
      where: { id, userId: user.id },
    });

    return NextResponse.json({
      phoneNumber: num
        ? {
            id: num.id,
            phoneNumber: num.phoneNumber,
            label: num.label,
          }
        : null,
    });
  } catch (err) {
    console.error("PATCH /api/settings/phone-numbers error", err);
    return NextResponse.json(
      { error: "Failed to update phone number" },
      { status: 500 }
    );
  }
}
