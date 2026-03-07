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

    let settings = await prisma.companySetting.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await prisma.companySetting.create({
        data: {
          userId: user.id,
          companyName: user.company || "Realty Corp Pakistan",
          website: "",
          address: "",
          callStart: "09:00",
          callEnd: "18:00",
        },
      });
    }

    return NextResponse.json({
      settings: {
        companyName: settings.companyName ?? "",
        website: settings.website ?? "",
        address: settings.address ?? "",
        callStart: settings.callStart ?? "09:00",
        callEnd: settings.callEnd ?? "18:00",
        notifyNewLead: settings.notifyNewLead,
        notifyAppointment: settings.notifyAppointment,
        notifyCampaignDone: settings.notifyCampaignDone,
        notifyDailySummary: settings.notifyDailySummary,
      },
    });
  } catch (err) {
    console.error("GET /api/settings/company error", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getOrCreateAuthenticatedUser(req);
    if (!user) return unauthorizedJsonResponse();
    const body = await req.json();

    const existing = await prisma.companySetting.findUnique({
      where: { userId: user.id },
    });

    const data: any = {};
    if ("companyName" in body) data.companyName = body.companyName;
    if ("website" in body) data.website = body.website;
    if ("address" in body) data.address = body.address;
    if ("callStart" in body) data.callStart = body.callStart;
    if ("callEnd" in body) data.callEnd = body.callEnd;
    if ("notifyNewLead" in body) data.notifyNewLead = body.notifyNewLead;
    if ("notifyAppointment" in body) data.notifyAppointment = body.notifyAppointment;
    if ("notifyCampaignDone" in body) data.notifyCampaignDone = body.notifyCampaignDone;
    if ("notifyDailySummary" in body) data.notifyDailySummary = body.notifyDailySummary;

    const updated = await prisma.companySetting.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json({
      settings: {
        companyName: updated.companyName ?? "",
        website: updated.website ?? "",
        address: updated.address ?? "",
        callStart: updated.callStart ?? "09:00",
        callEnd: updated.callEnd ?? "18:00",
        notifyNewLead: updated.notifyNewLead,
        notifyAppointment: updated.notifyAppointment,
        notifyCampaignDone: updated.notifyCampaignDone,
        notifyDailySummary: updated.notifyDailySummary,
      },
    });
  } catch (err) {
    console.error("PATCH /api/settings/company error", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

