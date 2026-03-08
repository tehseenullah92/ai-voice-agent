// Mock data for Convaire Dashboard

export const dashboardStats = {
  totalClients: 2847,
  activeCampaigns: 5,
  callsMadeToday: 342,
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
