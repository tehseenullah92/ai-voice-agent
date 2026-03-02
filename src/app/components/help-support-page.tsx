import { useState } from "react";
import {
  Search,
  Book,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  Bot,
  Megaphone,
  Target,
  BarChart3,
  Settings,
  PhoneForwarded,
  Users,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Headphones,
  Zap,
  Shield,
  HelpCircle,
  LifeBuoy,
  Ticket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";

/* ─── Mock Data ─── */
const categories = [
  {
    icon: Bot,
    title: "AI Voice Agents",
    desc: "Configure, customize, and manage your AI calling agents",
    articles: 12,
    color: "#1a8ee9",
  },
  {
    icon: Megaphone,
    title: "Campaigns",
    desc: "Create, launch, and monitor outbound calling campaigns",
    articles: 9,
    color: "#8b5cf6",
  },
  {
    icon: Target,
    title: "Lead Management",
    desc: "Lead scoring, qualification, and pipeline management",
    articles: 8,
    color: "#ef4444",
  },
  {
    icon: PhoneForwarded,
    title: "Phone Numbers",
    desc: "Provision, configure, and manage your phone numbers",
    articles: 6,
    color: "#ec4899",
  },
  {
    icon: Users,
    title: "Clients & CRM",
    desc: "Import contacts, manage client lists, and CRM features",
    articles: 10,
    color: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Dashboards, call metrics, and performance tracking",
    articles: 7,
    color: "#f59e0b",
  },
  {
    icon: Settings,
    title: "Account & Billing",
    desc: "Manage your account settings, plans, and invoices",
    articles: 11,
    color: "#64748b",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    desc: "Data protection, compliance, and security features",
    articles: 5,
    color: "#0b5b9a",
  },
];

const popularArticles = [
  {
    title: "Getting Started with VoiceEstate",
    category: "Onboarding",
    readTime: "5 min",
    views: 2340,
  },
  {
    title: "How to Configure Your First AI Agent",
    category: "AI Voice Agents",
    readTime: "8 min",
    views: 1890,
  },
  {
    title: "Launching Your First Campaign",
    category: "Campaigns",
    readTime: "6 min",
    views: 1650,
  },
  {
    title: "Understanding Lead Scoring",
    category: "Lead Management",
    readTime: "4 min",
    views: 1420,
  },
  {
    title: "Importing Contacts from CSV",
    category: "Clients & CRM",
    readTime: "3 min",
    views: 1380,
  },
  {
    title: "Setting Up Phone Numbers",
    category: "Phone Numbers",
    readTime: "5 min",
    views: 1200,
  },
];

const faqs = [
  {
    q: "How do I reset my AI agent's configuration?",
    a: "Navigate to the AI Agents page, select the agent you want to reset, click the settings icon, and choose 'Reset to Default.' This will restore all default settings while preserving your call history and analytics.",
  },
  {
    q: "Why are my calls not connecting?",
    a: "Common reasons include: invalid phone numbers in your contact list, insufficient call credits, phone number not properly configured, or calling outside business hours. Check your Campaign settings and ensure your phone numbers have active status in the Phone Numbers page.",
  },
  {
    q: "How does the lead scoring algorithm work?",
    a: "Our AI analyzes multiple signals during calls: conversation duration, keyword triggers (e.g., 'interested', 'budget', 'visit'), sentiment analysis, and engagement level. Leads are automatically classified as Hot (80-100), Warm (50-79), or Cold (0-49).",
  },
  {
    q: "Can I customize the AI agent's voice and language?",
    a: "Yes! Go to AI Agents > Select Agent > Voice Settings. You can choose from 20+ voice profiles, adjust speech rate and pitch, and select from supported languages including English, Urdu, Punjabi, Hindi, and Arabic.",
  },
  {
    q: "How do I export my call logs and reports?",
    a: "Go to Analytics > Reports, select the date range, choose the metrics you want to include, and click 'Export.' We support CSV, PDF, and Excel formats. You can also set up automated weekly reports via Settings > Notifications.",
  },
  {
    q: "What happens when I exceed my plan's call limit?",
    a: "When you reach 90% of your call limit, we'll notify you via email and in-app. Once the limit is reached, campaigns will pause automatically. You can upgrade your plan or purchase additional call credits from the Billing page.",
  },
  {
    q: "How do I integrate VoiceEstate with my existing CRM?",
    a: "We offer native integrations with Salesforce, HubSpot, Zoho, and Pipedrive. Go to Settings > Integrations, select your CRM, and follow the authorization flow. For custom CRMs, use our REST API with webhook support.",
  },
  {
    q: "Is my data secure and compliant?",
    a: "VoiceEstate is SOC 2 Type II certified, GDPR compliant, and uses AES-256 encryption at rest and TLS 1.3 in transit. All call recordings are encrypted, and we offer data residency options for enterprise customers.",
  },
];

const mockTickets = [
  {
    id: "TKT-2847",
    subject: "Campaign not starting after scheduling",
    status: "open",
    priority: "high",
    created: "2 hours ago",
    lastUpdate: "1 hour ago",
  },
  {
    id: "TKT-2841",
    subject: "Unable to import CSV with special characters",
    status: "in-progress",
    priority: "medium",
    created: "1 day ago",
    lastUpdate: "4 hours ago",
  },
  {
    id: "TKT-2835",
    subject: "Request for custom AI voice profile",
    status: "resolved",
    priority: "low",
    created: "3 days ago",
    lastUpdate: "1 day ago",
  },
  {
    id: "TKT-2830",
    subject: "Billing discrepancy on last invoice",
    status: "resolved",
    priority: "medium",
    created: "5 days ago",
    lastUpdate: "3 days ago",
  },
];

const videoGuides = [
  {
    title: "Platform Overview & Quick Start",
    duration: "12:34",
    category: "Getting Started",
  },
  {
    title: "Configuring AI Voice Agents",
    duration: "18:22",
    category: "AI Agents",
  },
  {
    title: "Creating Effective Campaigns",
    duration: "15:45",
    category: "Campaigns",
  },
  {
    title: "Advanced Analytics Walkthrough",
    duration: "10:18",
    category: "Analytics",
  },
  {
    title: "Managing Phone Numbers & Routing",
    duration: "8:56",
    category: "Phone Numbers",
  },
  {
    title: "CRM Integration Guide",
    duration: "14:02",
    category: "Integrations",
  },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", label: "Open" },
  "in-progress": {
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    label: "In Progress",
  },
  resolved: {
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    label: "Resolved",
  },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-red-50", text: "text-red-600" },
  medium: { bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
  low: { bg: "bg-[#f1f5f9]", text: "text-[#64748b]" },
};

export function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });

  const filteredArticles = searchQuery
    ? popularArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularArticles;

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSent(true);
      setContactForm({
        subject: "",
        category: "",
        priority: "medium",
        message: "",
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="bg-[#0f172a] -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1a8ee9]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/10 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
            <LifeBuoy className="w-3.5 h-3.5 text-[#1a8ee9]" />
            <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>
              Help Center
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl text-white mb-2"
            style={{ fontWeight: 700 }}
          >
            How can we help you?
          </h1>
          <p className="text-sm text-[#94a3b8] mb-6">
            Search our knowledge base, browse guides, or contact our support
            team.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search for articles, guides, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-[5px] bg-white text-[#0f172a] text-sm border-0 outline-none placeholder:text-[#94a3b8] shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Book,
            label: "Documentation",
            desc: "Full platform docs",
            color: "#1a8ee9",
          },
          {
            icon: Video,
            label: "Video Guides",
            desc: "Visual tutorials",
            color: "#8b5cf6",
          },
          {
            icon: MessageCircle,
            label: "Live Chat",
            desc: "Chat with support",
            color: "#10b981",
          },
          {
            icon: Ticket,
            label: "Submit Ticket",
            desc: "Create a request",
            color: "#f59e0b",
          },
        ].map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-3 p-4 rounded-[5px] border border-[#e2e8f0] bg-white hover:shadow-md hover:border-[#1a8ee9]/20 transition-all text-left"
          >
            <div
              className="w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.color + "12" }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div>
              <p
                className="text-sm text-[#0f172a]"
                style={{ fontWeight: 600 }}
              >
                {item.label}
              </p>
              <p className="text-xs text-[#94a3b8]">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="knowledge" className="space-y-6">
        <TabsList className="bg-[#f1f5f9] p-1 rounded-[5px] h-auto flex-wrap">
          <TabsTrigger
            value="knowledge"
            className="rounded-[5px] px-4 py-2 text-sm data-[state=active]:bg-[#1a8ee9] data-[state=active]:text-white"
          >
            <Book className="w-4 h-4 mr-1.5" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className="rounded-[5px] px-4 py-2 text-sm data-[state=active]:bg-[#1a8ee9] data-[state=active]:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-1.5" />
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="rounded-[5px] px-4 py-2 text-sm data-[state=active]:bg-[#1a8ee9] data-[state=active]:text-white"
          >
            <Video className="w-4 h-4 mr-1.5" />
            Video Guides
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="rounded-[5px] px-4 py-2 text-sm data-[state=active]:bg-[#1a8ee9] data-[state=active]:text-white"
          >
            <Ticket className="w-4 h-4 mr-1.5" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="rounded-[5px] px-4 py-2 text-sm data-[state=active]:bg-[#1a8ee9] data-[state=active]:text-white"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Contact Us
          </TabsTrigger>
        </TabsList>

        {/* ─── Knowledge Base ─── */}
        <TabsContent value="knowledge" className="space-y-6">
          {/* Categories Grid */}
          <div>
            <h3
              className="text-lg text-[#0f172a] mb-4"
              style={{ fontWeight: 600 }}
            >
              Browse by Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className="text-left p-4 rounded-[5px] border border-[#e2e8f0] bg-white hover:shadow-md hover:border-[#1a8ee9]/20 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-[5px] flex items-center justify-center mb-3"
                    style={{ backgroundColor: cat.color + "12" }}
                  >
                    <cat.icon
                      className="w-5 h-5"
                      style={{ color: cat.color }}
                    />
                  </div>
                  <p
                    className="text-sm text-[#0f172a] mb-1 group-hover:text-[#1a8ee9] transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    {cat.title}
                  </p>
                  <p className="text-xs text-[#94a3b8] mb-2 leading-relaxed">
                    {cat.desc}
                  </p>
                  <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>
                    {cat.articles} articles
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Articles */}
          <Card className="border-[#e2e8f0] shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-base" style={{ fontWeight: 600 }}>
                  Popular Articles
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[#f1f5f9]">
                {filteredArticles.map((article, i) => (
                  <button
                    key={i}
                    className="flex items-center justify-between w-full py-3.5 text-left hover:bg-[#f8fafc] -mx-2 px-2 rounded-[5px] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-[#94a3b8] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-[#0f172a] truncate group-hover:text-[#1a8ee9] transition-colors">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-[#94a3b8]">
                            {article.category}
                          </span>
                          <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#1a8ee9] shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
              {filteredArticles.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-[#e2e8f0] mx-auto mb-2" />
                  <p className="text-sm text-[#94a3b8]">
                    No articles match "{searchQuery}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FAQ ─── */}
        <TabsContent value="faq" className="space-y-4">
          <h3
            className="text-lg text-[#0f172a]"
            style={{ fontWeight: 600 }}
          >
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="border border-[#e2e8f0] rounded-[5px] overflow-hidden bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <span
                    className="text-sm text-[#0f172a] pr-4"
                    style={{ fontWeight: 500 }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94a3b8] shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaq === i ? "300px" : "0px",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="px-4 pb-4 text-sm text-[#64748b] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[5px] border border-[#e2e8f0]">
                <HelpCircle className="w-8 h-8 text-[#e2e8f0] mx-auto mb-2" />
                <p className="text-sm text-[#94a3b8]">
                  No FAQs match "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Video Guides ─── */}
        <TabsContent value="videos" className="space-y-4">
          <h3
            className="text-lg text-[#0f172a]"
            style={{ fontWeight: 600 }}
          >
            Video Tutorials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoGuides.map((video, i) => (
              <button
                key={i}
                className="text-left rounded-[5px] border border-[#e2e8f0] bg-white overflow-hidden hover:shadow-md hover:border-[#1a8ee9]/20 transition-all group"
              >
                {/* Thumbnail placeholder */}
                <div className="relative h-36 bg-[#0f172a] flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#1a8ee9]/5" />
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#1a8ee9] transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-5 h-5 ml-0.5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <p
                    className="text-sm text-[#0f172a] mb-1 group-hover:text-[#1a8ee9] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    {video.title}
                  </p>
                  <p className="text-xs text-[#94a3b8]">{video.category}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ─── My Tickets ─── */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg text-[#0f172a]"
              style={{ fontWeight: 600 }}
            >
              Support Tickets
            </h3>
            <Badge className="bg-[#1a8ee9]/10 text-[#1a8ee9] border-0 rounded-[5px]">
              {mockTickets.filter((t) => t.status !== "resolved").length} Active
            </Badge>
          </div>

          <div className="space-y-3">
            {mockTickets.map((ticket) => (
              <button
                key={ticket.id}
                className="w-full text-left p-4 rounded-[5px] border border-[#e2e8f0] bg-white hover:shadow-md hover:border-[#1a8ee9]/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-xs text-[#94a3b8] font-mono"
                        style={{ fontWeight: 500 }}
                      >
                        {ticket.id}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          statusColors[ticket.status].bg
                        } ${statusColors[ticket.status].text}`}
                        style={{ fontWeight: 500 }}
                      >
                        {statusColors[ticket.status].label}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          priorityColors[ticket.priority].bg
                        } ${priorityColors[ticket.priority].text}`}
                        style={{ fontWeight: 500 }}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p
                      className="text-sm text-[#0f172a] mb-1.5"
                      style={{ fontWeight: 500 }}
                    >
                      {ticket.subject}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Created {ticket.created}
                      </span>
                      <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Updated{" "}
                        {ticket.lastUpdate}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94a3b8] shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* ─── Contact Us ─── */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Methods */}
            <div className="space-y-3">
              <h3
                className="text-lg text-[#0f172a] mb-4"
                style={{ fontWeight: 600 }}
              >
                Get in Touch
              </h3>
              {[
                {
                  icon: MessageCircle,
                  title: "Live Chat",
                  desc: "Chat with our team in real-time",
                  detail: "Avg. response: 2 min",
                  color: "#10b981",
                  available: true,
                },
                {
                  icon: Mail,
                  title: "Email Support",
                  desc: "support@voiceestate.com",
                  detail: "Avg. response: 4 hours",
                  color: "#1a8ee9",
                  available: true,
                },
                {
                  icon: Phone,
                  title: "Phone Support",
                  desc: "+1 (800) 555-0199",
                  detail: "Mon-Fri, 9 AM - 6 PM EST",
                  color: "#8b5cf6",
                  available: true,
                },
                {
                  icon: Headphones,
                  title: "Priority Support",
                  desc: "Dedicated account manager",
                  detail: "Enterprise plan only",
                  color: "#f59e0b",
                  available: false,
                },
              ].map((method, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-[5px] border bg-white transition-all ${
                    method.available
                      ? "border-[#e2e8f0] hover:shadow-md hover:border-[#1a8ee9]/20 cursor-pointer"
                      : "border-[#e2e8f0] opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-[5px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: method.color + "12" }}
                    >
                      <method.icon
                        className="w-4 h-4"
                        style={{ color: method.color }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm text-[#0f172a]"
                          style={{ fontWeight: 600 }}
                        >
                          {method.title}
                        </p>
                        {method.available && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {method.desc}
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">
                        {method.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-[#e2e8f0] shadow-none">
                <CardHeader className="pb-0">
                  <CardTitle>
                    <span className="text-base" style={{ fontWeight: 600 }}>
                      Submit a Support Ticket
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contactSent ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-7 h-7 text-[#10b981]" />
                      </div>
                      <h4
                        className="text-lg text-[#0f172a] mb-2"
                        style={{ fontWeight: 600 }}
                      >
                        Ticket Submitted!
                      </h4>
                      <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
                        Your ticket has been created successfully. You'll
                        receive a confirmation email shortly.
                        <br />
                        Ticket ID:{" "}
                        <span
                          className="text-[#0f172a] font-mono"
                          style={{ fontWeight: 500 }}
                        >
                          TKT-2848
                        </span>
                      </p>
                      <button
                        onClick={() => setContactSent(false)}
                        className="text-sm text-[#1a8ee9] hover:text-[#0b5b9a] transition-colors"
                        style={{ fontWeight: 500 }}
                      >
                        Submit another ticket
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleContactSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[#475569]">
                            Category
                          </Label>
                          <select
                            value={contactForm.category}
                            onChange={(e) =>
                              setContactForm((f) => ({
                                ...f,
                                category: e.target.value,
                              }))
                            }
                            className="w-full h-10 px-3 rounded-[5px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] outline-none focus:border-[#1a8ee9] focus:ring-2 focus:ring-[#1a8ee9]/20"
                          >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c.title} value={c.title}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[#475569]">
                            Priority
                          </Label>
                          <select
                            value={contactForm.priority}
                            onChange={(e) =>
                              setContactForm((f) => ({
                                ...f,
                                priority: e.target.value,
                              }))
                            }
                            className="w-full h-10 px-3 rounded-[5px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] outline-none focus:border-[#1a8ee9] focus:ring-2 focus:ring-[#1a8ee9]/20"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-[#475569]">
                          Subject
                        </Label>
                        <Input
                          placeholder="Brief description of your issue"
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              subject: e.target.value,
                            }))
                          }
                          className="h-10 rounded-[5px] border-[#e2e8f0] bg-white text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-[#475569]">
                          Message
                        </Label>
                        <textarea
                          placeholder="Describe your issue in detail. Include steps to reproduce, expected behavior, and any error messages..."
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((f) => ({
                              ...f,
                              message: e.target.value,
                            }))
                          }
                          rows={5}
                          className="w-full px-3 py-2.5 rounded-[5px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] outline-none focus:border-[#1a8ee9] focus:ring-2 focus:ring-[#1a8ee9]/20 resize-none placeholder:text-[#94a3b8]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-[#94a3b8]">
                          Avg. response time: 4 hours
                        </p>
                        <button
                          type="submit"
                          disabled={
                            contactLoading ||
                            !contactForm.subject ||
                            !contactForm.message
                          }
                          className="h-10 px-6 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                          style={{ fontWeight: 500 }}
                        >
                          {contactLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Submit Ticket
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <div className="bg-[#f8fafc] rounded-[5px] border border-[#e2e8f0] p-6 sm:p-8 text-center">
        <h3
          className="text-lg text-[#0f172a] mb-2"
          style={{ fontWeight: 600 }}
        >
          Still need help?
        </h3>
        <p className="text-sm text-[#64748b] mb-4 max-w-md mx-auto">
          Our support team is available 24/7. Schedule a call with a support
          specialist for personalized assistance.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="h-9 px-5 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
            <Phone className="w-3.5 h-3.5" /> Schedule a Call
          </button>
          <button className="h-9 px-5 border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] rounded-[5px] text-sm transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
            <ExternalLink className="w-3.5 h-3.5" /> Visit Community
          </button>
        </div>
      </div>
    </div>
  );
}
