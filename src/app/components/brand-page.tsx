import { useState } from "react";
import {
  Headphones, Copy, Check, ChevronRight, Type, Palette, Square,
  Layers, MousePointer2, ToggleLeft, AlertCircle, Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useNavigate } from "react-router";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded-[5px] hover:bg-muted transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function ColorSwatch({ name, hex, token, dark }: { name: string; hex: string; token: string; dark?: boolean }) {
  return (
    <div className="group">
      <div className={`h-20 rounded-[5px] border border-border mb-2 flex items-end p-2 transition-transform hover:scale-105 ${dark ? "" : ""}`} style={{ backgroundColor: hex }}>
        <span className={`text-[10px] ${dark ? "text-white" : "text-black"} opacity-0 group-hover:opacity-100 transition-opacity`} style={{ fontWeight: 500 }}>{hex}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-foreground" style={{ fontWeight: 500 }}>{name}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{token}</p>
        </div>
        <CopyButton text={hex} />
      </div>
    </div>
  );
}

export function BrandPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg text-foreground" style={{ fontWeight: 600 }}>VoiceEstate</span>
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Brand Guidelines</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/home")}>Back to Home</Button>
            <Button size="sm" onClick={() => navigate("/dashboard")}>Open Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-16">

        {/* ── Hero ── */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#1a8ee9]" />
            <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Design System</span>
          </div>
          <h1 className="text-3xl lg:text-5xl text-foreground tracking-tight" style={{ fontWeight: 700 }}>
            Brand & Design Guidelines
          </h1>
          <p className="text-muted-foreground mt-4 text-base lg:text-lg">
            The complete design system for VoiceEstate — colors, typography, components, and usage guidelines.
          </p>
        </div>

        {/* ── Logo ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Logo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Primary */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Primary Logo</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-white rounded-[5px] border border-border p-8 flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center shadow-lg shadow-[#1a8ee9]/20">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl text-[#0f172a]" style={{ fontWeight: 700 }}>VoiceEstate</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Use on light backgrounds</p>
              </CardContent>
            </Card>
            {/* Dark */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Dark Logo</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-[#0f172a] rounded-[5px] p-8 flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl text-white" style={{ fontWeight: 700 }}>VoiceEstate</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Use on dark backgrounds</p>
              </CardContent>
            </Card>
            {/* Icon only */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Icon Mark</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-[#f8fafc] rounded-[5px] border border-border p-8 flex items-center justify-center gap-6">
                  {[48, 36, 24].map((s) => (
                    <div key={s} className="rounded-[5px] bg-[#1a8ee9] flex items-center justify-center" style={{ width: s, height: s }}>
                      <Headphones className="text-white" style={{ width: s * 0.5, height: s * 0.5 }} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Available in 48px, 36px, 24px</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Colors ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Color Palette</h2>
          </div>

          <Tabs defaultValue="brand">
            <TabsList className="mb-6">
              <TabsTrigger value="brand">Brand Colors</TabsTrigger>
              <TabsTrigger value="ui">UI Colors</TabsTrigger>
              <TabsTrigger value="semantic">Semantic</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <ColorSwatch name="Primary" hex="#1a8ee9" token="--primary" dark />
                <ColorSwatch name="Primary Hover" hex="#0b5b9a" token="--primary-hover" dark />
                <ColorSwatch name="Dark Navy" hex="#0f172a" token="--sidebar" dark />
                <ColorSwatch name="Slate" hex="#1e293b" token="--card-dark" dark />
                <ColorSwatch name="Accent Blue" hex="#06b6d4" token="--chart-2" dark />
                <ColorSwatch name="White" hex="#FFFFFF" token="--card" />
              </div>
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="text-sm mb-4" style={{ fontWeight: 600 }}>Color Usage</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="h-16 rounded-[5px] bg-[#1a8ee9] mb-2" />
                      <p className="text-xs text-muted-foreground font-mono">#1a8ee9</p>
                      <p className="text-xs text-muted-foreground">Primary buttons, CTAs</p>
                    </div>
                    <div>
                      <div className="h-16 rounded-[5px] bg-[#0f172a] mb-2" />
                      <p className="text-xs text-muted-foreground font-mono">#0f172a</p>
                      <p className="text-xs text-muted-foreground">Sidebar, dark sections</p>
                    </div>
                    <div>
                      <div className="h-16 rounded-[5px] bg-[#0b5b9a] mb-2" />
                      <p className="text-xs text-muted-foreground font-mono">#0b5b9a</p>
                      <p className="text-xs text-muted-foreground">Hover states, accents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ui">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <ColorSwatch name="Background" hex="#f8fafc" token="--background" />
                <ColorSwatch name="Card" hex="#FFFFFF" token="--card" />
                <ColorSwatch name="Muted" hex="#f1f5f9" token="--muted" />
                <ColorSwatch name="Accent" hex="#e2e8f0" token="--accent" />
                <ColorSwatch name="Foreground" hex="#0f172a" token="--foreground" dark />
                <ColorSwatch name="Muted FG" hex="#64748b" token="--muted-fg" dark />
              </div>
            </TabsContent>

            <TabsContent value="semantic">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <ColorSwatch name="Success" hex="#10b981" token="emerald-500" dark />
                <ColorSwatch name="Warning" hex="#f59e0b" token="amber-500" />
                <ColorSwatch name="Error" hex="#dc2626" token="--destructive" dark />
                <ColorSwatch name="Info" hex="#1a8ee9" token="--primary" dark />
                <ColorSwatch name="Purple" hex="#8b5cf6" token="violet-500" dark />
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <ColorSwatch name="Chart 1" hex="#1a8ee9" token="--chart-1" dark />
                <ColorSwatch name="Chart 2" hex="#06b6d4" token="--chart-2" dark />
                <ColorSwatch name="Chart 3" hex="#0b5b9a" token="--chart-3" dark />
                <ColorSwatch name="Chart 4" hex="#f59e0b" token="--chart-4" />
                <ColorSwatch name="Chart 5" hex="#10b981" token="--chart-5" dark />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Typography ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Typography</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs bg-muted px-2 py-1 rounded-[5px] font-mono text-muted-foreground">font-family</span>
                  <span className="text-sm text-foreground">'Inter', system-ui, sans-serif</span>
                </div>
              </div>
              <div className="space-y-6 divide-y divide-border">
                {[
                  { label: "Display", size: "text-5xl", weight: 700, example: "AI That Calls" },
                  { label: "H1", size: "text-3xl", weight: 700, example: "Dashboard Overview" },
                  { label: "H2", size: "text-2xl", weight: 600, example: "Active Campaigns" },
                  { label: "H3", size: "text-xl", weight: 600, example: "Call Statistics" },
                  { label: "H4", size: "text-lg", weight: 500, example: "Recent Leads" },
                  { label: "Body", size: "text-base", weight: 400, example: "Welcome back! Here's your real estate calling overview." },
                  { label: "Small", size: "text-sm", weight: 400, example: "Last updated 2 minutes ago" },
                  { label: "Caption", size: "text-xs", weight: 500, example: "STATUS: ACTIVE" },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pt-4 first:pt-0">
                    <div className="w-20 shrink-0">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontWeight: 500 }}>{t.label}</span>
                    </div>
                    <div className="flex-1">
                      <span className={`${t.size} text-foreground`} style={{ fontWeight: t.weight }}>{t.example}</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-[5px]">{t.size}</span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-[5px]">w:{t.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Spacing & Radius ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Square className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Border Radius</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { name: "Small", value: "1px", token: "--radius-sm" },
                  { name: "Medium", value: "3px", token: "--radius-md" },
                  { name: "Default", value: "5px", token: "--radius-lg" },
                  { name: "Large", value: "9px", token: "--radius-xl" },
                ].map((r) => (
                  <div key={r.name} className="text-center">
                    <div className="w-20 h-20 mx-auto bg-[#1a8ee9] mb-3" style={{ borderRadius: r.value }} />
                    <p className="text-sm text-foreground" style={{ fontWeight: 500 }}>{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.value}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{r.token}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Components ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <MousePointer2 className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Components</h2>
          </div>

          <Tabs defaultValue="buttons">
            <TabsList className="mb-6">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="misc">Misc</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Variants</p>
                    <div className="flex flex-wrap gap-3">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Sizes</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button>Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon"><Headphones className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>With Icons</p>
                    <div className="flex flex-wrap gap-3">
                      <Button><Headphones className="w-4 h-4" /> Get Started</Button>
                      <Button variant="outline"><Copy className="w-4 h-4" /> Copy</Button>
                      <Button variant="secondary"><Sparkles className="w-4 h-4" /> AI Agent</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>States</p>
                    <div className="flex flex-wrap gap-3">
                      <Button>Enabled</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Default Variants</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Status Badges</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Paused</Badge>
                      <Badge className="bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20">Scheduled</Badge>
                      <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200">Draft</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Lead Interest</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-red-100 text-red-700 border-red-200">Hot</Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Warm</Badge>
                      <Badge className="bg-[#1a8ee9]/10 text-[#1a8ee9] border-[#1a8ee9]/20">Cold</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inputs">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Default Input</label>
                      <Input placeholder="Enter client name..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Disabled Input</label>
                      <Input placeholder="Disabled..." disabled />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Search Input</label>
                      <div className="relative">
                        <Input placeholder="Search..." className="pl-9" />
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">With Label</label>
                      <Input placeholder="admin@realtycorp.pk" type="email" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="misc">
              <Card>
                <CardContent className="pt-6 space-y-8">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Toggles / Switches</p>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                        <span className="text-sm">Enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch />
                        <span className="text-sm">Disabled</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Progress Bars</p>
                    <div className="space-y-3 max-w-md">
                      <Progress value={75} />
                      <Progress value={45} />
                      <Progress value={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3" style={{ fontWeight: 500 }}>Cards</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">KPI Card</CardTitle></CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[5px] bg-[#1a8ee9]/10 flex items-center justify-center">
                              <Headphones className="w-5 h-5 text-[#1a8ee9]" />
                            </div>
                            <div>
                              <p className="text-2xl text-foreground" style={{ fontWeight: 600 }}>2,847</p>
                              <p className="text-xs text-muted-foreground">Active Calls</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-[#1a8ee9] shadow-lg shadow-[#1a8ee9]/10">
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Highlighted Card</CardTitle></CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-[5px] bg-[#1a8ee9]/10 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-[#1a8ee9]" />
                            </div>
                            <div>
                              <p className="text-2xl text-foreground" style={{ fontWeight: 600 }}>Pro Plan</p>
                              <p className="text-xs text-muted-foreground">Active subscription</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Shadows ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Shadows & Elevation</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { name: "Small", cls: "shadow-sm" },
                  { name: "Medium", cls: "shadow-md" },
                  { name: "Large", cls: "shadow-lg" },
                  { name: "XL (Brand)", cls: "shadow-xl shadow-[#1a8ee9]/15" },
                ].map((s) => (
                  <div key={s.name} className="text-center">
                    <div className={`w-full h-24 bg-white rounded-[5px] border border-border ${s.cls} mb-3`} />
                    <p className="text-sm text-foreground" style={{ fontWeight: 500 }}>{s.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{s.cls}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Usage Guidelines ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-[#1a8ee9]" />
            <h2 className="text-xl text-foreground" style={{ fontWeight: 600 }}>Usage Guidelines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-emerald-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-emerald-700" style={{ fontWeight: 600 }}>Do's</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Use #1a8ee9 as the primary action color for buttons and links",
                    "Use #0b5b9a for hover/pressed states on primary elements",
                    "Maintain consistent 5px border-radius across all components",
                    "Use the dark navy sidebar (#0f172a) for navigation",
                    "Use Inter font family throughout the application",
                    "Use brand color for logo marks and premium elements",
                  ].map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </div>
                  <span className="text-sm text-red-700" style={{ fontWeight: 600 }}>Don'ts</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Don't use black (#000000) as a primary button color",
                    "Don't stretch or distort the logo icon",
                    "Don't use border-radius larger than 9px on components",
                    "Don't mix the brand blue with competing blue shades",
                    "Don't use light backgrounds for the sidebar navigation",
                    "Don't use more than 2 font weights on the same element",
                  ].map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}