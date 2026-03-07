// Mock data for Convaire Dashboard

export const dashboardStats = {
  totalClients: 2847,
  activeCampaigns: 5,
  callsMadeToday: 342,
  leadsThisWeek: 89,
  appointmentsThisWeek: 23,
  conversionRate: 12.4,
  totalCallsMade: 1856,
  avgCallDuration: "2m 34s",
};

export const callsPerDay = [
  { day: "Mon", calls: 245 },
  { day: "Tue", calls: 312 },
  { day: "Wed", calls: 289 },
  { day: "Thu", calls: 356 },
  { day: "Fri", calls: 278 },
  { day: "Sat", calls: 198 },
  { day: "Sun", calls: 342 },
];

export const callOutcomes = [
  { name: "Interested", value: 312, color: "#10b981" },
  { name: "Not Interested", value: 487, color: "#ef4444" },
  { name: "No Answer", value: 298, color: "#f59e0b" },
  { name: "Callback", value: 156, color: "#1a8ee9" },
  { name: "Voicemail", value: 89, color: "#8b5cf6" },
];

export const recentLeads = [
  { id: "1", name: "Ahmed Khan", phone: "+92 321 4567890", campaign: "DHA Islamabad Phase 5", interest: "hot" as const, date: "2026-02-28" },
  { id: "2", name: "Sara Ali", phone: "+92 300 1234567", campaign: "Giga Mall Extension", interest: "warm" as const, date: "2026-02-28" },
  { id: "3", name: "Usman Tariq", phone: "+92 333 9876543", campaign: "Imaarat Residences", interest: "hot" as const, date: "2026-02-27" },
  { id: "4", name: "Fatima Noor", phone: "+92 312 5551234", campaign: "DHA Islamabad Phase 5", interest: "cold" as const, date: "2026-02-27" },
  { id: "5", name: "Bilal Hussain", phone: "+92 345 7778899", campaign: "Bahria Town Karachi", interest: "warm" as const, date: "2026-02-26" },
];

export const clients = [
  { id: "1", name: "Ahmed Khan", phone: "+92 321 4567890", location: "Islamabad", tags: ["Investor", "Premium"], status: "active" as const, source: "CSV Import", createdAt: "2026-01-15" },
  { id: "2", name: "Sara Ali", phone: "+92 300 1234567", location: "Lahore", tags: ["End User"], status: "active" as const, source: "Manual", createdAt: "2026-01-20" },
  { id: "3", name: "Usman Tariq", phone: "+92 333 9876543", location: "Karachi", tags: ["Investor"], status: "active" as const, source: "CSV Import", createdAt: "2026-01-22" },
  { id: "4", name: "Fatima Noor", phone: "+92 312 5551234", location: "Rawalpindi", tags: ["End User", "Premium"], status: "inactive" as const, source: "Referral", createdAt: "2026-02-01" },
  { id: "5", name: "Bilal Hussain", phone: "+92 345 7778899", location: "Faisalabad", tags: ["Investor"], status: "active" as const, source: "Website", createdAt: "2026-02-05" },
  { id: "6", name: "Aisha Malik", phone: "+92 301 2223344", location: "Islamabad", tags: ["End User"], status: "active" as const, source: "CSV Import", createdAt: "2026-02-08" },
  { id: "7", name: "Hassan Raza", phone: "+92 322 5556677", location: "Lahore", tags: ["Investor", "VIP"], status: "active" as const, source: "Referral", createdAt: "2026-02-10" },
  { id: "8", name: "Zainab Shah", phone: "+92 311 8889900", location: "Islamabad", tags: ["End User"], status: "do_not_call" as const, source: "Manual", createdAt: "2026-02-12" },
];

export const campaigns = [
  { id: "1", name: "DHA Phase 5 Launch", project: "DHA Islamabad Phase 5", totalClients: 450, called: 312, remaining: 138, interested: 45, status: "active" as const, createdAt: "2026-02-01", language: "Urdu", concurrency: 5 },
  { id: "2", name: "Giga Mall Investor Outreach", project: "Giga Mall Extension", totalClients: 280, called: 280, remaining: 0, interested: 38, status: "completed" as const, createdAt: "2026-01-25", language: "English", concurrency: 3 },
  { id: "3", name: "Imaarat Residences Push", project: "Imaarat Residences", totalClients: 520, called: 189, remaining: 331, interested: 28, status: "active" as const, createdAt: "2026-02-10", language: "Both", concurrency: 8 },
  { id: "4", name: "Bahria Town Karachi Wave 2", project: "Bahria Town Karachi", totalClients: 350, called: 0, remaining: 350, interested: 0, status: "draft" as const, createdAt: "2026-02-25", language: "Urdu", concurrency: 5 },
  { id: "5", name: "Blue World City Revival", project: "Blue World City", totalClients: 180, called: 95, remaining: 85, interested: 12, status: "paused" as const, createdAt: "2026-02-15", language: "Urdu", concurrency: 4 },
];

export const leads = [
  { id: "1", clientName: "Ahmed Khan", phone: "+92 321 4567890", campaign: "DHA Phase 5 Launch", project: "DHA Islamabad Phase 5", interest: "hot" as const, date: "2026-02-28", notes: "Very interested in 10 marla plots. Budget 2.5 crore.", assignedTo: "Ali Agent", status: "new" as const },
  { id: "2", name: "Sara Ali", phone: "+92 300 1234567", campaign: "Giga Mall Investor Outreach", project: "Giga Mall Extension", interest: "warm" as const, date: "2026-02-28", notes: "Wants commercial investment. Needs payment plan details.", assignedTo: "Unassigned", status: "follow-up" as const },
  { id: "3", clientName: "Usman Tariq", phone: "+92 333 9876543", campaign: "Imaarat Residences Push", project: "Imaarat Residences", interest: "hot" as const, date: "2026-02-27", notes: "Looking for 2-bed apartment. Ready to visit.", assignedTo: "Sara Agent", status: "new" as const },
  { id: "4", clientName: "Fatima Noor", phone: "+92 312 5551234", campaign: "DHA Phase 5 Launch", project: "DHA Islamabad Phase 5", interest: "cold" as const, date: "2026-02-27", notes: "Not actively looking, but might consider in 6 months.", assignedTo: "Unassigned", status: "dead" as const },
  { id: "5", clientName: "Bilal Hussain", phone: "+92 345 7778899", campaign: "Bahria Town Karachi Wave 2", project: "Bahria Town Karachi", interest: "warm" as const, date: "2026-02-26", notes: "Interested in villas. Comparing with other projects.", assignedTo: "Ali Agent", status: "converted" as const },
];

export const callLogs = [
  { id: "1", clientName: "Ahmed Khan", phone: "+92 321 4567890", campaign: "DHA Phase 5 Launch", date: "2026-02-28 14:32", duration: "3:12", status: "completed" as const, outcome: "interested" as const },
  { id: "2", clientName: "Sara Ali", phone: "+92 300 1234567", campaign: "Giga Mall Investor Outreach", date: "2026-02-28 14:15", duration: "2:45", status: "completed" as const, outcome: "callback" as const },
  { id: "3", clientName: "Usman Tariq", phone: "+92 333 9876543", campaign: "Imaarat Residences Push", date: "2026-02-28 13:50", duration: "0:00", status: "no-answer" as const, outcome: "no_answer" as const },
  { id: "4", clientName: "Fatima Noor", phone: "+92 312 5551234", campaign: "DHA Phase 5 Launch", date: "2026-02-28 13:30", duration: "1:23", status: "completed" as const, outcome: "not_interested" as const },
  { id: "5", clientName: "Bilal Hussain", phone: "+92 345 7778899", campaign: "Bahria Town Karachi Wave 2", date: "2026-02-28 12:45", duration: "4:01", status: "completed" as const, outcome: "interested" as const },
  { id: "6", clientName: "Aisha Malik", phone: "+92 301 2223344", campaign: "DHA Phase 5 Launch", date: "2026-02-28 12:20", duration: "2:15", status: "completed" as const, outcome: "callback" as const },
  { id: "7", clientName: "Hassan Raza", phone: "+92 322 5556677", campaign: "Imaarat Residences Push", date: "2026-02-28 11:55", duration: "0:00", status: "failed" as const, outcome: "no_answer" as const },
];

export const appointments = [
  { id: "1", clientName: "Ahmed Khan", phone: "+92 321 4567890", project: "DHA Islamabad Phase 5", type: "site_visit" as const, scheduledAt: "2026-03-01 10:00", status: "scheduled" as const, assignedAgent: "Ali Agent" },
  { id: "2", clientName: "Usman Tariq", phone: "+92 333 9876543", project: "Imaarat Residences", type: "site_visit" as const, scheduledAt: "2026-03-01 14:00", status: "scheduled" as const, assignedAgent: "Sara Agent" },
  { id: "3", clientName: "Sara Ali", phone: "+92 300 1234567", project: "Giga Mall Extension", type: "callback" as const, scheduledAt: "2026-03-02 11:00", status: "scheduled" as const, assignedAgent: "Ali Agent" },
  { id: "4", clientName: "Bilal Hussain", phone: "+92 345 7778899", project: "Bahria Town Karachi", type: "site_visit" as const, scheduledAt: "2026-02-27 15:00", status: "completed" as const, assignedAgent: "Sara Agent" },
  { id: "5", clientName: "Aisha Malik", phone: "+92 301 2223344", project: "DHA Islamabad Phase 5", type: "callback" as const, scheduledAt: "2026-02-26 09:00", status: "no-show" as const, assignedAgent: "Ali Agent" },
];

export const leadsOverTime = [
  { day: "Mon", hot: 5, warm: 8, cold: 3 },
  { day: "Tue", hot: 7, warm: 12, cold: 5 },
  { day: "Wed", hot: 4, warm: 9, cold: 2 },
  { day: "Thu", hot: 9, warm: 11, cold: 4 },
  { day: "Fri", hot: 6, warm: 7, cold: 3 },
  { day: "Sat", hot: 3, warm: 5, cold: 1 },
  { day: "Sun", hot: 8, warm: 10, cold: 6 },
];

// Client list membership mapping (listId -> clientIds)
export const clientListMembers: Record<string, string[]> = {
  "1": ["1", "5", "6", "7"], // Islamabad Investors
  "2": ["2", "7"],           // DHA Lahore Leads
  "3": ["3", "5"],           // Karachi High Net Worth
  "4": ["4", "6", "8"],      // Rawalpindi End Users
  "5": ["1", "3", "5"],      // Overseas Pakistanis
  "6": ["1", "2", "3", "5", "7"], // Bahria Town Interested
};