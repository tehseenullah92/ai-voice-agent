import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  getOrCreateAuthenticatedUser,
  unauthorizedJsonResponse,
} from "../../../lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");

    const leads = await prisma.lead.findMany({
      where: {
        userId: user.id,
        ...(campaignId ? { campaignId } : {}),
      },
      orderBy: { date: "desc" },
    });

    const shaped = leads.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      campaign: l.campaign ?? "",
      project: l.project ?? "",
      interest: l.interest,
      status: l.status,
      assignedTo: l.assignedTo ?? "Unassigned",
      date: l.date.toISOString().split("T")[0],
      notes: l.notes ?? "",
    }));

    return NextResponse.json({ leads: shaped });
  } catch (err) {
    console.error("GET /api/leads error", err);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();
    const {
      name,
      phone,
      campaign,
      project,
      interest,
      status,
      assignedTo,
      notes,
      date,
    } = body;

    if (!name || !phone || !interest) {
      return NextResponse.json(
        { error: "Name, phone, and interest are required" },
        { status: 400 }
      );
    }

    const created = await prisma.lead.create({
      data: {
        userId: user.id,
        name,
        phone,
        campaign,
        project,
        interest,
        status,
        assignedTo,
        notes,
        date: date ? new Date(date) : undefined,
      },
    });

    const shaped = {
      id: created.id,
      name: created.name,
      phone: created.phone,
      campaign: created.campaign ?? "",
      project: created.project ?? "",
      interest: created.interest,
      status: created.status,
      assignedTo: created.assignedTo ?? "Unassigned",
      date: created.date.toISOString().split("T")[0],
      notes: created.notes ?? "",
    };

    return NextResponse.json({ lead: shaped }, { status: 201 });
  } catch (err) {
    console.error("POST /api/leads error", err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

