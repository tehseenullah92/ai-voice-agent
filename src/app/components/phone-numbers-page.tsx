import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Phone, Plus, Search, ShoppingCart, CreditCard, CheckCircle2,
  Globe, MapPin, Tag, Megaphone, Trash2, Settings2, DollarSign,
  PhoneForwarded, AlertCircle, Loader2, Zap, Shield,
  PhoneIncoming, PhoneOutgoing, Bot, Mic, Clock, Volume2,
  MessageSquare, ArrowDownLeft, ArrowUpRight, Save,
  Calculator, TrendingUp, Info,
} from "lucide-react";
import { toast } from "sonner";

// ── AI Config types ──

type AIConfig = {
  enabled: boolean;
  assistantName: string;
  voiceId: string;
  language: string;
  systemPrompt: string;
  greeting: string;
  maxDurationSec: number;
  recordCalls: boolean;
  transcribeEnabled: boolean;
};

type InboundConfig = AIConfig & {
  fallbackNumber: string;
  afterHoursMessage: string;
  businessHoursOnly: boolean;
};

type OutboundConfig = AIConfig & {
  callerIdName: string;
  retryOnNoAnswer: boolean;
  retryAttempts: number;
  timeBetweenRetriesSec: number;
};

type PhoneNumber = {
  id: string;
  number: string;
  label: string;
  country: string;
  type: "local" | "tollfree" | "mobile";
  status: "active" | "inactive" | "pending";
  assignedCampaign: string | null;
  monthlyCost: number;
  purchasedAt: string;
  inbound: InboundConfig;
  outbound: OutboundConfig;
};

type AvailableNumber = {
  id: string;
  number: string;
  country: string;
  region: string;
  type: "local" | "tollfree" | "mobile";
  monthlyCost: number;
  setupFee: number;
  capabilities: string[];
};

// ── Default configs ──

const defaultInbound: InboundConfig = {
  enabled: false,
  assistantName: "",
  voiceId: "alloy",
  language: "en-US",
  systemPrompt: "",
  greeting: "Hello! Thank you for calling. How can I help you today?",
  maxDurationSec: 300,
  recordCalls: true,
  transcribeEnabled: true,
  fallbackNumber: "",
  afterHoursMessage: "We're currently closed. Please call back during business hours or leave a message.",
  businessHoursOnly: false,
};

const defaultOutbound: OutboundConfig = {
  enabled: false,
  assistantName: "",
  voiceId: "alloy",
  language: "en-US",
  systemPrompt: "",
  greeting: "Hi, this is a call from VoiceEstate regarding a property you may be interested in.",
  maxDurationSec: 180,
  recordCalls: true,
  transcribeEnabled: true,
  callerIdName: "VoiceEstate",
  retryOnNoAnswer: true,
  retryAttempts: 2,
  timeBetweenRetriesSec: 3600,
};

// ── Mock AI assistants ──

const aiAssistants = [
  { id: "lead-qualifier", name: "Lead Qualifier", desc: "Qualifies inbound leads by budget, timeline & preferences" },
  { id: "appointment-setter", name: "Appointment Setter", desc: "Books property viewings and meetings with agents" },
  { id: "property-info", name: "Property Info Agent", desc: "Answers FAQs about listed properties, pricing & amenities" },
  { id: "follow-up", name: "Follow-Up Agent", desc: "Re-engages cold leads with personalized outreach" },
  { id: "campaign-caller", name: "Campaign Caller", desc: "Runs outbound campaign scripts for new project launches" },
  { id: "survey-agent", name: "Survey Agent", desc: "Conducts post-interaction satisfaction surveys" },
];

const voiceOptions = [
  { id: "alloy", name: "Alloy", desc: "Neutral, professional" },
  { id: "echo", name: "Echo", desc: "Warm, conversational" },
  { id: "fable", name: "Fable", desc: "Expressive, friendly" },
  { id: "onyx", name: "Onyx", desc: "Deep, authoritative" },
  { id: "nova", name: "Nova", desc: "Energetic, youthful" },
  { id: "shimmer", name: "Shimmer", desc: "Soft, empathetic" },
];

const languageOptions = [
  { id: "en-US", name: "English (US)" },
  { id: "en-GB", name: "English (UK)" },
  { id: "ur-PK", name: "Urdu (Pakistan)" },
  { id: "ar-SA", name: "Arabic (Saudi)" },
  { id: "hi-IN", name: "Hindi (India)" },
];

// ── Mock data ──

const initialMyNumbers: PhoneNumber[] = [
  {
    id: "1", number: "+92 51 1234567", label: "Primary Campaign Line", country: "Pakistan",
    type: "local", status: "active", assignedCampaign: "DHA Phase 5 Launch", monthlyCost: 15,
    purchasedAt: "2026-01-10",
    inbound: {
      ...defaultInbound, enabled: true, assistantName: "lead-qualifier",
      systemPrompt: "You are a real estate lead qualifier for Realty Corp Pakistan. Ask about their budget (PKR), preferred location in Islamabad, timeline, and whether they're looking for residential or commercial property. Be polite and professional.",
      greeting: "Assalamu Alaikum! Thank you for calling Realty Corp. I'm your AI assistant — how can I help you find your perfect property today?",
      businessHoursOnly: true, fallbackNumber: "+92 300 1234567",
    },
    outbound: {
      ...defaultOutbound, enabled: true, assistantName: "campaign-caller",
      systemPrompt: "You are calling on behalf of Realty Corp Pakistan about DHA Phase 5 new plots. Introduce the project, mention starting prices of 45 Lac PKR, and try to book a site visit. Be conversational and not pushy.",
      greeting: "Assalamu Alaikum! This is an AI assistant calling from Realty Corp. I'm reaching out about an exciting new opportunity in DHA Phase 5. Do you have a moment?",
      callerIdName: "Realty Corp",
    },
  },
  {
    id: "2", number: "+92 51 7654321", label: "Secondary Outreach", country: "Pakistan",
    type: "local", status: "active", assignedCampaign: "Imaarat Residences Push", monthlyCost: 15,
    purchasedAt: "2026-01-20",
    inbound: { ...defaultInbound },
    outbound: {
      ...defaultOutbound, enabled: true, assistantName: "follow-up",
      systemPrompt: "You are a follow-up agent for Realty Corp. Re-engage leads who showed interest in Imaarat Residences but didn't book a viewing. Mention the limited-time payment plan and try to schedule a visit.",
      callerIdName: "Realty Corp",
    },
  },
  {
    id: "3", number: "+92 300 8889999", label: "Mobile Line", country: "Pakistan",
    type: "mobile", status: "inactive", assignedCampaign: null, monthlyCost: 20,
    purchasedAt: "2026-02-05",
    inbound: { ...defaultInbound },
    outbound: { ...defaultOutbound },
  },
];

const availableNumbersData: AvailableNumber[] = [
  { id: "a1", number: "+92 51 2001001", country: "Pakistan", region: "Islamabad", type: "local", monthlyCost: 15, setupFee: 5, capabilities: ["Voice", "SMS"] },
  { id: "a2", number: "+92 51 2001002", country: "Pakistan", region: "Islamabad", type: "local", monthlyCost: 15, setupFee: 5, capabilities: ["Voice", "SMS"] },
  { id: "a3", number: "+92 42 3001001", country: "Pakistan", region: "Lahore", type: "local", monthlyCost: 15, setupFee: 5, capabilities: ["Voice"] },
  { id: "a4", number: "+92 21 4001001", country: "Pakistan", region: "Karachi", type: "local", monthlyCost: 15, setupFee: 5, capabilities: ["Voice", "SMS"] },
  { id: "a5", number: "+92 300 1112233", country: "Pakistan", region: "Nationwide", type: "mobile", monthlyCost: 20, setupFee: 10, capabilities: ["Voice", "SMS", "WhatsApp"] },
  { id: "a6", number: "+92 300 4445566", country: "Pakistan", region: "Nationwide", type: "mobile", monthlyCost: 20, setupFee: 10, capabilities: ["Voice", "SMS", "WhatsApp"] },
  { id: "a7", number: "+971 4 5001001", country: "UAE", region: "Dubai", type: "local", monthlyCost: 25, setupFee: 10, capabilities: ["Voice"] },
  { id: "a8", number: "+971 4 5001002", country: "UAE", region: "Dubai", type: "local", monthlyCost: 25, setupFee: 10, capabilities: ["Voice"] },
  { id: "a9", number: "+971 50 1112233", country: "UAE", region: "Nationwide", type: "mobile", monthlyCost: 35, setupFee: 15, capabilities: ["Voice", "SMS"] },
  { id: "a10", number: "+1 202 5551234", country: "USA", region: "Washington DC", type: "local", monthlyCost: 5, setupFee: 1, capabilities: ["Voice", "SMS"] },
  { id: "a11", number: "+1 800 5551234", country: "USA", region: "Nationwide", type: "tollfree", monthlyCost: 10, setupFee: 2, capabilities: ["Voice", "SMS"] },
  { id: "a12", number: "+44 20 71234567", country: "UK", region: "London", type: "local", monthlyCost: 8, setupFee: 2, capabilities: ["Voice", "SMS"] },
  { id: "a13", number: "+966 11 5001234", country: "Saudi Arabia", region: "Riyadh", type: "local", monthlyCost: 30, setupFee: 15, capabilities: ["Voice"] },
];

// ── Style maps ──

const typeStyles: Record<string, string> = {
  local: "bg-blue-100 text-blue-700 border-blue-200",
  tollfree: "bg-purple-100 text-purple-700 border-purple-200",
  mobile: "bg-orange-100 text-orange-700 border-orange-200",
};
const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};
const countries = [
  { value: "all", label: "All Countries" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "UAE", label: "UAE" },
  { value: "USA", label: "USA" },
  { value: "UK", label: "UK" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
];

// ── Per-minute pricing data (based on VAPI + Twilio rates) ──

type PricingTier = {
  country: string;
  flag: string;
  inboundPerMin: number;
  outboundPerMin: number;
  vapiAiPerMin: number;
  transcriptionPerMin: number;
};

const pricingData: PricingTier[] = [
  { country: "Pakistan", flag: "PK", inboundPerMin: 0.0085, outboundPerMin: 0.15, vapiAiPerMin: 0.05, transcriptionPerMin: 0.01 },
  { country: "UAE", flag: "AE", inboundPerMin: 0.01, outboundPerMin: 0.25, vapiAiPerMin: 0.05, transcriptionPerMin: 0.01 },
  { country: "USA", flag: "US", inboundPerMin: 0.0085, outboundPerMin: 0.014, vapiAiPerMin: 0.05, transcriptionPerMin: 0.01 },
  { country: "UK", flag: "GB", inboundPerMin: 0.01, outboundPerMin: 0.04, vapiAiPerMin: 0.05, transcriptionPerMin: 0.01 },
  { country: "Saudi Arabia", flag: "SA", inboundPerMin: 0.012, outboundPerMin: 0.30, vapiAiPerMin: 0.05, transcriptionPerMin: 0.01 },
];

// ── Mock usage data ──

type NumberUsage = {
  numberId: string;
  inboundMinutes: number;
  outboundMinutes: number;
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  transcribedMinutes: number;
  estimatedCost: number;
};

const mockUsageData: NumberUsage[] = [
  { numberId: "1", inboundMinutes: 142, outboundMinutes: 287, totalCalls: 234, inboundCalls: 89, outboundCalls: 145, transcribedMinutes: 380, estimatedCost: 48.65 },
  { numberId: "2", inboundMinutes: 18, outboundMinutes: 196, totalCalls: 112, inboundCalls: 12, outboundCalls: 100, transcribedMinutes: 196, estimatedCost: 33.20 },
  { numberId: "3", inboundMinutes: 0, outboundMinutes: 0, totalCalls: 0, inboundCalls: 0, outboundCalls: 0, transcribedMinutes: 0, estimatedCost: 0 },
];

// ═══════════════════════════════════════════════════
// PRICING SECTION COMPONENT
// ═══════════════════════════════════════════════════

function PricingSection() {
  const [calcCountry, setCalcCountry] = useState("Pakistan");
  const [calcMinutes, setCalcMinutes] = useState(1);
  const [calcDirection, setCalcDirection] = useState<"inbound" | "outbound">("outbound");
  const [calcTranscribe, setCalcTranscribe] = useState(true);

  const pricing = pricingData.find((p) => p.country === calcCountry) || pricingData[0];

  const telephonyCost = calcDirection === "inbound"
    ? pricing.inboundPerMin * calcMinutes
    : pricing.outboundPerMin * calcMinutes;
  const aiCost = pricing.vapiAiPerMin * calcMinutes;
  const transcriptionCost = calcTranscribe ? pricing.transcriptionPerMin * calcMinutes : 0;
  const totalCost = telephonyCost + aiCost + transcriptionCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-4 h-4" />
          Pricing & Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per-minute rate table */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Per-minute rates by country (USD)</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Inbound</TableHead>
                  <TableHead className="text-right">Outbound</TableHead>
                  <TableHead className="text-right">AI Agent</TableHead>
                  <TableHead className="text-right">Transcription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData.map((p) => (
                  <TableRow key={p.country}>
                    <TableCell className="text-sm">{p.country}</TableCell>
                    <TableCell className="text-right text-sm font-mono">${p.inboundPerMin.toFixed(4)}</TableCell>
                    <TableCell className="text-right text-sm font-mono">${p.outboundPerMin.toFixed(3)}</TableCell>
                    <TableCell className="text-right text-sm font-mono">${p.vapiAiPerMin.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-sm font-mono">${p.transcriptionPerMin.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-start gap-2 mt-3 text-[10px] text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Telephony rates via Twilio. AI Agent cost via VAPI includes LLM inference + voice synthesis. Rates may vary.</span>
            </div>
          </div>

          {/* Interactive calculator */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <p className="text-sm">Cost Calculator</p>
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={calcCountry} onValueChange={setCalcCountry}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {pricingData.map((p) => (
                    <SelectItem key={p.country} value={p.country}>{p.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Direction */}
            <div className="space-y-1.5">
              <Label className="text-xs">Direction</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCalcDirection("inbound")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm transition-colors ${
                    calcDirection === "inbound"
                      ? "border-teal-300 bg-teal-50 text-teal-700"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <PhoneIncoming className="w-3.5 h-3.5" />
                  Inbound
                </button>
                <button
                  onClick={() => setCalcDirection("outbound")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm transition-colors ${
                    calcDirection === "outbound"
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <PhoneOutgoing className="w-3.5 h-3.5" />
                  Outbound
                </button>
              </div>
            </div>

            {/* Minutes slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Call Duration</Label>
                <span className="text-sm tabular-nums">{calcMinutes} min</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={calcMinutes}
                onChange={(e) => setCalcMinutes(Number(e.target.value))}
                className="w-full h-2 accent-primary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 min</span>
                <span>15 min</span>
                <span>30 min</span>
              </div>
            </div>

            {/* Transcription toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Include Transcription</span>
              <Switch checked={calcTranscribe} onCheckedChange={setCalcTranscribe} />
            </div>

            {/* Cost breakdown */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  Telephony ({calcDirection})
                </span>
                <span className="font-mono">${telephonyCost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Bot className="w-3 h-3" />
                  VAPI AI Agent
                </span>
                <span className="font-mono">${aiCost.toFixed(4)}</span>
              </div>
              {calcTranscribe && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" />
                    Transcription
                  </span>
                  <span className="font-mono">${transcriptionCost.toFixed(4)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-sm">Total for {calcMinutes} min</span>
                <span className="text-lg font-mono text-primary">${totalCost.toFixed(4)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                {calcMinutes === 1 ? "That's" : "Per minute:"} ~${(totalCost / calcMinutes).toFixed(4)}/min all-in
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════
// USAGE SECTION COMPONENT
// ═══════════════════════════════════════════════════

function UsageSection({ myNumbers }: { myNumbers: PhoneNumber[] }) {
  const totalUsage = mockUsageData.reduce(
    (acc, u) => ({
      inboundMin: acc.inboundMin + u.inboundMinutes,
      outboundMin: acc.outboundMin + u.outboundMinutes,
      totalCalls: acc.totalCalls + u.totalCalls,
      cost: acc.cost + u.estimatedCost,
    }),
    { inboundMin: 0, outboundMin: 0, totalCalls: 0, cost: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" />
          Usage This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Calls</p>
            <p className="text-xl mt-0.5">{totalUsage.totalCalls}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-3">
            <p className="text-xs text-teal-600 flex items-center gap-1"><PhoneIncoming className="w-2.5 h-2.5" />Inbound Minutes</p>
            <p className="text-xl mt-0.5 text-teal-700">{totalUsage.inboundMin}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3">
            <p className="text-xs text-indigo-600 flex items-center gap-1"><PhoneOutgoing className="w-2.5 h-2.5" />Outbound Minutes</p>
            <p className="text-xl mt-0.5 text-indigo-700">{totalUsage.outboundMin}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />Est. Usage Cost</p>
            <p className="text-xl mt-0.5 text-amber-700">${totalUsage.cost.toFixed(2)}</p>
          </div>
        </div>

        {/* Per-number breakdown */}
        <p className="text-sm text-muted-foreground mb-2">Per-number breakdown</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1"><PhoneIncoming className="w-3 h-3 text-teal-500" />Inbound</span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1"><PhoneOutgoing className="w-3 h-3 text-indigo-500" />Outbound</span>
              </TableHead>
              <TableHead className="text-right">Total Calls</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Transcribed</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myNumbers.map((num) => {
              const usage = mockUsageData.find((u) => u.numberId === num.id);
              return (
                <TableRow key={num.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-mono">{num.number}</p>
                      <p className="text-[10px] text-muted-foreground">{num.label}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className="text-teal-600">{usage?.inboundMinutes ?? 0} min</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({usage?.inboundCalls ?? 0})</span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className="text-indigo-600">{usage?.outboundMinutes ?? 0} min</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({usage?.outboundCalls ?? 0})</span>
                  </TableCell>
                  <TableCell className="text-right text-sm">{usage?.totalCalls ?? 0}</TableCell>
                  <TableCell className="text-right text-sm hidden sm:table-cell">{usage?.transcribedMinutes ?? 0} min</TableCell>
                  <TableCell className="text-right text-sm font-mono">${(usage?.estimatedCost ?? 0).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-start gap-2 mt-3 text-[10px] text-muted-foreground">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <span>
            Usage data refreshes hourly. Final billing is calculated at end of billing cycle.
            Costs include telephony + AI agent + transcription fees.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export function PhoneNumbersPage() {
  const [myNumbers, setMyNumbers] = useState<PhoneNumber[]>(initialMyNumbers);
  const [buyOpen, setBuyOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [selectedAvailable, setSelectedAvailable] = useState<AvailableNumber | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [manageTab, setManageTab] = useState("general");

  // Buy dialog filters
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit fields
  const [editLabel, setEditLabel] = useState("");
  const [editInbound, setEditInbound] = useState<InboundConfig>(defaultInbound);
  const [editOutbound, setEditOutbound] = useState<OutboundConfig>(defaultOutbound);

  // Derived stats
  const totalMonthlyCost = myNumbers.reduce((sum, n) => sum + n.monthlyCost, 0);
  const activeCount = myNumbers.filter((n) => n.status === "active").length;
  const inboundCount = myNumbers.filter((n) => n.inbound.enabled).length;
  const outboundCount = myNumbers.filter((n) => n.outbound.enabled).length;

  const filteredAvailable = availableNumbersData
    .filter((n) => !myNumbers.some((m) => m.number === n.number))
    .filter((n) => countryFilter === "all" || n.country === countryFilter)
    .filter((n) => typeFilter === "all" || n.type === typeFilter)
    .filter((n) =>
      n.number.includes(searchQuery) ||
      n.region.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // ── Handlers ──

  const openBuy = () => {
    setCountryFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
    setBuyOpen(true);
  };

  const selectForPurchase = (num: AvailableNumber) => {
    setSelectedAvailable(num);
    setConfirmOpen(true);
  };

  const handlePurchase = () => {
    if (!selectedAvailable) return;
    setPurchasing(true);
    setTimeout(() => {
      const newNumber: PhoneNumber = {
        id: String(Date.now()),
        number: selectedAvailable.number,
        label: `${selectedAvailable.region} Line`,
        country: selectedAvailable.country,
        type: selectedAvailable.type,
        status: "active",
        assignedCampaign: null,
        monthlyCost: selectedAvailable.monthlyCost,
        purchasedAt: new Date().toISOString().split("T")[0],
        inbound: { ...defaultInbound },
        outbound: { ...defaultOutbound },
      };
      setMyNumbers((prev) => [...prev, newNumber]);
      setPurchasing(false);
      setConfirmOpen(false);
      setBuyOpen(false);
      setSuccessOpen(true);
    }, 2000);
  };

  const openDetail = (num: PhoneNumber) => {
    setSelectedNumber(num);
    setEditLabel(num.label);
    setEditInbound({ ...num.inbound });
    setEditOutbound({ ...num.outbound });
    setManageTab("general");
    setDetailOpen(true);
  };

  const handleSaveAll = () => {
    if (!selectedNumber) return;
    setMyNumbers((prev) =>
      prev.map((n) =>
        n.id === selectedNumber.id
          ? { ...n, label: editLabel, inbound: { ...editInbound }, outbound: { ...editOutbound } }
          : n
      )
    );
    setSelectedNumber((prev) =>
      prev ? { ...prev, label: editLabel, inbound: { ...editInbound }, outbound: { ...editOutbound } } : prev
    );
    toast.success("Number configuration saved");
  };

  const toggleStatus = (num: PhoneNumber) => {
    const newStatus = num.status === "active" ? "inactive" : "active";
    setMyNumbers((prev) =>
      prev.map((n) =>
        n.id === num.id
          ? { ...n, status: newStatus, assignedCampaign: newStatus === "inactive" ? null : n.assignedCampaign }
          : n
      )
    );
    setSelectedNumber((prev) =>
      prev && prev.id === num.id ? { ...prev, status: newStatus } : prev
    );
    toast.success(`Number ${newStatus === "active" ? "activated" : "deactivated"}`);
  };

  const releaseNumber = (num: PhoneNumber) => {
    setMyNumbers((prev) => prev.filter((n) => n.id !== num.id));
    setDetailOpen(false);
    toast.success(`Number ${num.number} released. It will be removed at end of billing cycle.`);
  };

  // ── Helpers for the AI config sub-forms ──

  function AIDirectionBadge({ inbound, outbound }: { inbound: boolean; outbound: boolean }) {
    if (!inbound && !outbound) {
      return <span className="text-[10px] text-muted-foreground/50 italic">No AI</span>;
    }
    return (
      <div className="flex gap-1">
        {inbound && (
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-[10px] px-1.5 py-0 gap-0.5">
            <ArrowDownLeft className="w-2.5 h-2.5" />
            In
          </Badge>
        )}
        {outbound && (
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 gap-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" />
            Out
          </Badge>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Phone Numbers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Purchase, manage, and configure AI inbound & outbound calling for your numbers.
          </p>
        </div>
        <Button size="sm" onClick={openBuy}>
          <ShoppingCart className="w-4 h-4" />
          Buy Number
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <p className="text-2xl mt-1">{myNumbers.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <p className="text-2xl mt-1 text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <PhoneIncoming className="w-4 h-4 text-teal-500" />
              <p className="text-xs text-muted-foreground">Inbound AI</p>
            </div>
            <p className="text-2xl mt-1 text-teal-600">{inboundCount}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <PhoneOutgoing className="w-4 h-4 text-indigo-500" />
              <p className="text-xs text-muted-foreground">Outbound AI</p>
            </div>
            <p className="text-2xl mt-1 text-indigo-600">{outboundCount}</p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
            <p className="text-2xl mt-1 text-purple-600">
              {myNumbers.filter((n) => n.assignedCampaign).length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Cost/mo</p>
            </div>
            <p className="text-2xl mt-1">${totalMonthlyCost}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── My Numbers Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4" />
            My Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {myNumbers.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Phone className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No phone numbers yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Buy your first number to start making AI-powered calls.
              </p>
              <Button size="sm" className="mt-4" onClick={openBuy}>
                <ShoppingCart className="w-4 h-4" />
                Buy Your First Number
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>AI Capabilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Campaign</TableHead>
                  <TableHead className="hidden lg:table-cell">Cost/mo</TableHead>
                  <TableHead className="w-24">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myNumbers.map((num) => (
                  <TableRow key={num.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-mono">{num.number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{num.label}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={typeStyles[num.type]}>
                        {num.type === "tollfree" ? "Toll-Free" : num.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AIDirectionBadge inbound={num.inbound.enabled} outbound={num.outbound.enabled} />
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[num.status]}>{num.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {num.assignedCampaign || (
                        <span className="text-muted-foreground/50 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      ${num.monthlyCost}/mo
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openDetail(num)}>
                        <Settings2 className="w-3 h-3" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Pricing & Cost Calculator ── */}
      <PricingSection />

      {/* ── Usage This Month ── */}
      <UsageSection myNumbers={myNumbers} />

      {/* ── How it Works ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" />
            How AI Calling Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inbound */}
            <div className="border border-teal-200 bg-teal-50/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <PhoneIncoming className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm">Inbound AI</p>
                  <p className="text-xs text-muted-foreground">AI answers incoming calls</p>
                </div>
              </div>
              <div className="space-y-2 pl-10">
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 text-xs mt-0.5">1.</span>
                  <p className="text-xs text-muted-foreground">A prospect calls your number and AI answers instantly with your custom greeting</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 text-xs mt-0.5">2.</span>
                  <p className="text-xs text-muted-foreground">AI qualifies the lead — asking about budget, location, timeline using your system prompt</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600 text-xs mt-0.5">3.</span>
                  <p className="text-xs text-muted-foreground">AI books appointments, captures info, and logs the call with full transcript</p>
                </div>
              </div>
            </div>
            {/* Outbound */}
            <div className="border border-indigo-200 bg-indigo-50/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <PhoneOutgoing className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm">Outbound AI</p>
                  <p className="text-xs text-muted-foreground">AI makes calls on your behalf</p>
                </div>
              </div>
              <div className="space-y-2 pl-10">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 text-xs mt-0.5">1.</span>
                  <p className="text-xs text-muted-foreground">Launch a campaign — AI dials each lead using this number as caller ID</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 text-xs mt-0.5">2.</span>
                  <p className="text-xs text-muted-foreground">AI delivers your pitch, handles objections, and follows your script/prompt</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600 text-xs mt-0.5">3.</span>
                  <p className="text-xs text-muted-foreground">Auto-retries no-answers, logs outcomes, and updates lead status in CRM</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════ */}
      {/* BUY NUMBER DIALOG                                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="sm:max-w-[780px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Buy a Phone Number
            </DialogTitle>
            <DialogDescription>
              Browse available numbers from our global inventory powered by VAPI & Twilio.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 pb-2">
            <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search by number or region..." className="bg-transparent outline-none text-sm w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tollfree">Toll-Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto max-h-[400px] space-y-2 pr-1">
            {filteredAvailable.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">No numbers found matching your filters.</p>
              </div>
            ) : (
              filteredAvailable.map((num) => (
                <div key={num.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-mono">{num.number}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{num.region}, {num.country}
                        </span>
                        <Badge className={`${typeStyles[num.type]} text-[10px] px-1.5 py-0`}>
                          {num.type === "tollfree" ? "Toll-Free" : num.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {num.capabilities.map((cap) => (
                          <span key={cap} className="text-[10px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded">{cap}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm">${num.monthlyCost}<span className="text-xs text-muted-foreground">/mo</span></p>
                    {num.setupFee > 0 && <p className="text-[10px] text-muted-foreground">+ ${num.setupFee} setup</p>}
                    <Button size="sm" className="mt-1.5" onClick={() => selectForPurchase(num)}>
                      <ShoppingCart className="w-3 h-3" />Buy
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            Numbers provisioned via VAPI & Twilio. Billed monthly to your account.
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PURCHASE CONFIRMATION DIALOG                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!purchasing) setConfirmOpen(open); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>Review your number purchase before confirming.</DialogDescription>
          </DialogHeader>
          {selectedAvailable && (
            <div className="space-y-4 py-2">
              <div className="bg-accent/50 rounded-lg p-4 text-center">
                <Phone className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-lg font-mono">{selectedAvailable.number}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />{selectedAvailable.region}, {selectedAvailable.country}
                  </span>
                  <Badge className={`${typeStyles[selectedAvailable.type]} text-[10px]`}>
                    {selectedAvailable.type === "tollfree" ? "Toll-Free" : selectedAvailable.type}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Setup Fee (one-time)</span>
                  <span>${selectedAvailable.setupFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Recurring</span>
                  <span>${selectedAvailable.monthlyCost.toFixed(2)}/mo</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span>Due Today</span>
                  <span className="text-base">${(selectedAvailable.setupFee + selectedAvailable.monthlyCost).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Capabilities</p>
                <div className="flex gap-1.5">
                  {selectedAvailable.capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Default payment method</p>
                </div>
                <Button variant="link" size="sm" className="text-xs px-0">Change</Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Number will be provisioned instantly. You can configure inbound & outbound AI after purchase.</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={purchasing}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={purchasing}>
              {purchasing ? (<><Loader2 className="w-4 h-4 animate-spin" />Provisioning...</>) : (<><CreditCard className="w-4 h-4" />Confirm & Pay</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PURCHASE SUCCESS DIALOG                               */}
      {/* ══════════════════════════════════════════════════════ */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle>Number Purchased!</DialogTitle>
              <DialogDescription>Your new number is ready to configure.</DialogDescription>
            </DialogHeader>
            {selectedAvailable && (
              <div className="mt-4 bg-accent/50 rounded-lg p-3">
                <p className="text-lg font-mono">{selectedAvailable.number}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedAvailable.region}, {selectedAvailable.country}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Click "Manage" on your new number to set up inbound & outbound AI capabilities.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setSuccessOpen(false)}>Done</Button>
            <Button onClick={() => { setSuccessOpen(false); openBuy(); }}>
              <Plus className="w-4 h-4" />Buy Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════ */}
      {/* MANAGE NUMBER DIALOG  (General / Inbound / Outbound) */}
      {/* ══════════════════════════════════════════════════════ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              Manage Number
            </DialogTitle>
            <DialogDescription>
              Configure AI assistants for inbound & outbound calling.
            </DialogDescription>
          </DialogHeader>

          {selectedNumber && (
            <Tabs value={manageTab} onValueChange={setManageTab} className="flex-1 min-h-0 flex flex-col">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="general" className="gap-1.5">
                  <Phone className="w-3.5 h-3.5" />General
                </TabsTrigger>
                <TabsTrigger value="inbound" className="gap-1.5">
                  <PhoneIncoming className="w-3.5 h-3.5" />Inbound AI
                  {editInbound.enabled && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                </TabsTrigger>
                <TabsTrigger value="outbound" className="gap-1.5">
                  <PhoneOutgoing className="w-3.5 h-3.5" />Outbound AI
                  {editOutbound.enabled && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </TabsTrigger>
              </TabsList>

              {/* ── GENERAL TAB ── */}
              <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-1">
                {/* Number header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-mono">{selectedNumber.number}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={statusStyles[selectedNumber.status]}>{selectedNumber.status}</Badge>
                      <Badge className={typeStyles[selectedNumber.type]}>
                        {selectedNumber.type === "tollfree" ? "Toll-Free" : selectedNumber.type}
                      </Badge>
                      <AIDirectionBadge inbound={editInbound.enabled} outbound={editOutbound.enabled} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-2.5 h-2.5" />Country</p>
                    <p className="text-sm mt-0.5">{selectedNumber.country}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />Monthly Cost</p>
                    <p className="text-sm mt-0.5">${selectedNumber.monthlyCost}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Megaphone className="w-2.5 h-2.5" />Assigned Campaign</p>
                    <p className="text-sm mt-0.5">{selectedNumber.assignedCampaign || <span className="text-muted-foreground/50 italic">None</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Tag className="w-2.5 h-2.5" />Purchased</p>
                    <p className="text-sm mt-0.5">{selectedNumber.purchasedAt}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <Label>Label</Label>
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="e.g., Primary Campaign Line" />
                </div>

                <div className="border-t border-border pt-4 flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => toggleStatus(selectedNumber)}>
                    {selectedNumber.status === "active" ? (
                      <><PhoneForwarded className="w-4 h-4 text-amber-500" />Deactivate Number</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 text-green-500" />Activate Number</>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => releaseNumber(selectedNumber)}>
                    <Trash2 className="w-4 h-4" />Release Number
                    <span className="text-xs text-muted-foreground ml-auto">Stops billing at cycle end</span>
                  </Button>
                </div>
              </TabsContent>

              {/* ── INBOUND AI TAB ── */}
              <TabsContent value="inbound" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-1">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-teal-200 bg-teal-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                      <PhoneIncoming className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm">Enable Inbound AI</p>
                      <p className="text-xs text-muted-foreground">AI automatically answers incoming calls to this number</p>
                    </div>
                  </div>
                  <Switch
                    checked={editInbound.enabled}
                    onCheckedChange={(checked) => setEditInbound({ ...editInbound, enabled: checked })}
                  />
                </div>

                {editInbound.enabled && (
                  <div className="space-y-4">
                    {/* AI Assistant */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />AI Assistant</Label>
                      <Select value={editInbound.assistantName} onValueChange={(v) => setEditInbound({ ...editInbound, assistantName: v })}>
                        <SelectTrigger><SelectValue placeholder="Select an AI assistant..." /></SelectTrigger>
                        <SelectContent>
                          {aiAssistants.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex flex-col">
                                <span>{a.name}</span>
                                <span className="text-xs text-muted-foreground">{a.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Voice & Language */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />Voice</Label>
                        <Select value={editInbound.voiceId} onValueChange={(v) => setEditInbound({ ...editInbound, voiceId: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((v) => (
                              <SelectItem key={v.id} value={v.id}>{v.name} — {v.desc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Language</Label>
                        <Select value={editInbound.language} onValueChange={(v) => setEditInbound({ ...editInbound, language: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Greeting */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Welcome Greeting</Label>
                      <Textarea
                        rows={2}
                        value={editInbound.greeting}
                        onChange={(e) => setEditInbound({ ...editInbound, greeting: e.target.value })}
                        placeholder="What the AI says when it picks up..."
                      />
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />System Prompt (Instructions for AI)</Label>
                      <Textarea
                        rows={4}
                        value={editInbound.systemPrompt}
                        onChange={(e) => setEditInbound({ ...editInbound, systemPrompt: e.target.value })}
                        placeholder="Instruct the AI on how to handle inbound calls — what to ask, how to qualify, when to transfer..."
                        className="text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Tip: Include your company name, qualifying questions, and when to escalate to a human agent.
                      </p>
                    </div>

                    {/* Max duration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Max Call Duration</Label>
                        <Select
                          value={String(editInbound.maxDurationSec)}
                          onValueChange={(v) => setEditInbound({ ...editInbound, maxDurationSec: Number(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="120">2 minutes</SelectItem>
                            <SelectItem value="180">3 minutes</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="600">10 minutes</SelectItem>
                            <SelectItem value="900">15 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Fallback Number</Label>
                        <Input
                          placeholder="+92 300 XXXXXXX"
                          value={editInbound.fallbackNumber}
                          onChange={(e) => setEditInbound({ ...editInbound, fallbackNumber: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground">Transfer to human if AI can't handle the call</p>
                      </div>
                    </div>

                    {/* After-hours message */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />After-Hours Message</Label>
                      <Textarea
                        rows={2}
                        value={editInbound.afterHoursMessage}
                        onChange={(e) => setEditInbound({ ...editInbound, afterHoursMessage: e.target.value })}
                        placeholder="Message played when calling outside business hours..."
                      />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Business Hours Only</span>
                        </div>
                        <Switch checked={editInbound.businessHoursOnly} onCheckedChange={(v) => setEditInbound({ ...editInbound, businessHoursOnly: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Record Calls</span>
                        </div>
                        <Switch checked={editInbound.recordCalls} onCheckedChange={(v) => setEditInbound({ ...editInbound, recordCalls: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Transcribe Calls</span>
                        </div>
                        <Switch checked={editInbound.transcribeEnabled} onCheckedChange={(v) => setEditInbound({ ...editInbound, transcribeEnabled: v })} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── OUTBOUND AI TAB ── */}
              <TabsContent value="outbound" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-1">
                {/* Enable toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-200 bg-indigo-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <PhoneOutgoing className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm">Enable Outbound AI</p>
                      <p className="text-xs text-muted-foreground">AI uses this number to make campaign & follow-up calls</p>
                    </div>
                  </div>
                  <Switch
                    checked={editOutbound.enabled}
                    onCheckedChange={(checked) => setEditOutbound({ ...editOutbound, enabled: checked })}
                  />
                </div>

                {editOutbound.enabled && (
                  <div className="space-y-4">
                    {/* AI Assistant */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />AI Assistant</Label>
                      <Select value={editOutbound.assistantName} onValueChange={(v) => setEditOutbound({ ...editOutbound, assistantName: v })}>
                        <SelectTrigger><SelectValue placeholder="Select an AI assistant..." /></SelectTrigger>
                        <SelectContent>
                          {aiAssistants.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex flex-col">
                                <span>{a.name}</span>
                                <span className="text-xs text-muted-foreground">{a.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Voice & Language */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />Voice</Label>
                        <Select value={editOutbound.voiceId} onValueChange={(v) => setEditOutbound({ ...editOutbound, voiceId: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((v) => (
                              <SelectItem key={v.id} value={v.id}>{v.name} — {v.desc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Language</Label>
                        <Select value={editOutbound.language} onValueChange={(v) => setEditOutbound({ ...editOutbound, language: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {languageOptions.map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Caller ID Name */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Caller ID Name</Label>
                      <Input
                        value={editOutbound.callerIdName}
                        onChange={(e) => setEditOutbound({ ...editOutbound, callerIdName: e.target.value })}
                        placeholder="e.g., Realty Corp"
                      />
                      <p className="text-[10px] text-muted-foreground">Display name shown on recipient's phone (carrier dependent)</p>
                    </div>

                    {/* Opening Greeting */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />Opening Greeting</Label>
                      <Textarea
                        rows={2}
                        value={editOutbound.greeting}
                        onChange={(e) => setEditOutbound({ ...editOutbound, greeting: e.target.value })}
                        placeholder="First thing the AI says when the person picks up..."
                      />
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />System Prompt (Instructions for AI)</Label>
                      <Textarea
                        rows={4}
                        value={editOutbound.systemPrompt}
                        onChange={(e) => setEditOutbound({ ...editOutbound, systemPrompt: e.target.value })}
                        placeholder="Instruct the AI on pitch delivery, objection handling, and call-to-action (e.g., book a viewing)..."
                        className="text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Tip: Include product details, pricing, objection responses, and when to end the call gracefully.
                      </p>
                    </div>

                    {/* Max duration & Retry */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Max Call Duration</Label>
                        <Select
                          value={String(editOutbound.maxDurationSec)}
                          onValueChange={(v) => setEditOutbound({ ...editOutbound, maxDurationSec: Number(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="120">2 minutes</SelectItem>
                            <SelectItem value="180">3 minutes</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="600">10 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><PhoneForwarded className="w-3.5 h-3.5" />Retry Attempts</Label>
                        <Select
                          value={String(editOutbound.retryAttempts)}
                          onValueChange={(v) => setEditOutbound({ ...editOutbound, retryAttempts: Number(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No retries</SelectItem>
                            <SelectItem value="1">1 retry</SelectItem>
                            <SelectItem value="2">2 retries</SelectItem>
                            <SelectItem value="3">3 retries</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {editOutbound.retryAttempts > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Time Between Retries</Label>
                        <Select
                          value={String(editOutbound.timeBetweenRetriesSec)}
                          onValueChange={(v) => setEditOutbound({ ...editOutbound, timeBetweenRetriesSec: Number(v) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1800">30 minutes</SelectItem>
                            <SelectItem value="3600">1 hour</SelectItem>
                            <SelectItem value="7200">2 hours</SelectItem>
                            <SelectItem value="14400">4 hours</SelectItem>
                            <SelectItem value="86400">24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Toggles */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PhoneForwarded className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Retry on No Answer</span>
                        </div>
                        <Switch checked={editOutbound.retryOnNoAnswer} onCheckedChange={(v) => setEditOutbound({ ...editOutbound, retryOnNoAnswer: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Record Calls</span>
                        </div>
                        <Switch checked={editOutbound.recordCalls} onCheckedChange={(v) => setEditOutbound({ ...editOutbound, recordCalls: v })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">Transcribe Calls</span>
                        </div>
                        <Switch checked={editOutbound.transcribeEnabled} onCheckedChange={(v) => setEditOutbound({ ...editOutbound, transcribeEnabled: v })} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAll}>
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
