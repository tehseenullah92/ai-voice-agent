import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
  setSessionCookie,
} from "../../../../lib/server-auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        company: user.company ?? null,
      },
    });
  } catch (err) {
    console.error("GET /api/settings/profile error", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const body = await req.json();
    const { email: newEmail, name: newName } = body as {
      email?: string;
      name?: string;
    };

    const updates: { email?: string; name?: string } = {};
    if (typeof newEmail === "string" && newEmail.trim()) {
      const trimmed = newEmail.trim().toLowerCase();
      if (!isValidEmail(trimmed)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }
      if (trimmed !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: trimmed },
        });
        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 400 }
          );
        }
        updates.email = trimmed;
      }
    }
    if (typeof newName === "string" && newName.trim()) {
      updates.name = newName.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        profile: {
          name: user.name,
          email: user.email,
          company: user.company ?? null,
        },
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    const response = NextResponse.json({
      profile: {
        name: updated.name,
        email: updated.email,
        company: updated.company ?? null,
      },
    });

    if (updates.email) {
      setSessionCookie(response, updated.email);
    }

    return response;
  } catch (err) {
    console.error("PATCH /api/settings/profile error", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
