import {
  Users,
  Megaphone,
  PhoneCall,
  Target,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  dashboardStats,
  callsPerDay,
  callOutcomes,
  recentLeads,
  leadsOverTime,
  campaigns,
} from "./mock-data";
import { Progress } from "./ui/progress";

const statCards = [
  {
    label: "Total Clients",
    value: dashboardStats.totalClients.toLocaleString(),
    icon: Users,
    change: "+124",
    trend: "up" as const,
    color: "bg-[#1a8ee9]/10 text-[#1a8ee9]",
    borderColor: "border-[#1a8ee9]/20",
  },
  {
    label: "Active Campaigns",
    value: dashboardStats.activeCampaigns,
    icon: Megaphone,
    change: "+2",
    trend: "up" as const,
    color: "bg-purple-500/10 text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    label: "Calls Today",
    value: dashboardStats.callsMadeToday,
    icon: PhoneCall,
    change: "+58",
    trend: "up" as const,
    color: "bg-emerald-500/10 text-emerald-600",
    borderColor: "border-emerald-200",
  },
  {
    label: "Leads This Week",
    value: dashboardStats.leadsThisWeek,
    icon: Target,
    change: "+12",
    trend: "up" as const,
    color: "bg-orange-500/10 text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    label: "Appointments",
    value: dashboardStats.appointmentsThisWeek,
    icon: CalendarCheck,
    change: "-3",
    trend: "down" as const,
    color: "bg-pink-500/10 text-pink-600",
    borderColor: "border-pink-200",
  },
  {
    label: "Conversion Rate",
    value: `${dashboardStats.conversionRate}%`,
    icon: TrendingUp,
    change: "+1.2%",
    trend: "up" as const,
    color: "bg-[#0b5b9a]/10 text-[#0b5b9a]",
    borderColor: "border-[#0b5b9a]/20",
  },
];

const interestBadge = (level: "hot" | "warm" | "cold") => {
  const styles = {
    hot: "bg-red-100 text-red-700 border-red-200",
    warm: "bg-amber-100 text-amber-700 border-amber-200",
    cold: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
  };
  return styles[level];
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20",
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    paused: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return styles[status] || "";
};

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's your real estate calling overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="gap-4 hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-[5px] ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-0.5 text-xs ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calls Per Day */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1a8ee9]/10">
                <PhoneCall className="w-4 h-4 text-[#1a8ee9]" />
              </div>
              Calls Per Day (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={callsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#1a8ee9"
                    strokeWidth={2.5}
                    fill="#1a8ee9"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Call Outcomes */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1a8ee9]/10">
                <Target className="w-4 h-4 text-[#1a8ee9]" />
              </div>
              Call Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={callOutcomes}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {callOutcomes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Over Time + Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads trend */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1a8ee9]/10">
                <TrendingUp className="w-4 h-4 text-[#1a8ee9]" />
              </div>
              Leads by Interest (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={leadsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="hot" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="warm" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cold" stackId="a" fill="#1a8ee9" radius={[4, 4, 0, 0]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Megaphone className="w-4 h-4 text-purple-600" />
              </div>
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns
                .filter((c) => c.status === "active" || c.status === "paused")
                .map((campaign) => {
                  const progress = Math.round((campaign.called / campaign.totalClients) * 100);
                  return (
                    <div key={campaign.id} className="space-y-2 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.project}</p>
                        </div>
                        <Badge className={statusBadge(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {progress}%
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{campaign.called} called</span>
                        <span>{campaign.remaining} remaining</span>
                        <span className="text-[#1a8ee9]">{campaign.interested} interested</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/40 transition-colors border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[5px] bg-[#1a8ee9]/15 flex items-center justify-center text-sm text-[#1a8ee9]">
                      {lead.name[0]}
                    </div>
                    <div>
                      <p className="text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.campaign}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={interestBadge(lead.interest)}>
                      {lead.interest}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {lead.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1a8ee9]/10">
                <Clock className="w-4 h-4 text-[#1a8ee9]" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Calls Made</span>
                <span className="text-sm">{dashboardStats.totalCallsMade.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg. Call Duration</span>
                <span className="text-sm">{dashboardStats.avgCallDuration}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="text-sm text-emerald-600">{dashboardStats.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Active Campaigns</span>
                <span className="text-sm">{dashboardStats.activeCampaigns}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Appointments Today</span>
                <span className="text-sm text-[#1a8ee9]">4</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Hot Leads</span>
                <span className="text-sm text-red-500">18</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}