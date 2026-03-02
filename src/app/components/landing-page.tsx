import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Headphones, Phone, Target, Megaphone, CalendarCheck,
  PhoneForwarded, BarChart3, Bot, Globe, Shield, Zap,
  CheckCircle2, ArrowRight, Star, Play, Menu, X, ChevronRight,
  Sparkles, TrendingUp, MessageSquare, Settings,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

gsap.registerPlugin(ScrollTrigger);

/* ─────────── data ─────────── */
const features = [
  { icon: Bot, title: "AI Voice Agents", desc: "6 pre-built AI agents for property inquiries, follow-ups, appointment booking, and more — powered by VAPI.", color: "#1a8ee9" },
  { icon: Megaphone, title: "Smart Campaigns", desc: "Launch outbound calling campaigns with AI-driven scripts, auto-retries, and real-time call monitoring.", color: "#8b5cf6" },
  { icon: Target, title: "Lead Scoring", desc: "Auto-classify leads as Hot, Warm, or Cold based on conversation sentiment and engagement signals.", color: "#ef4444" },
  { icon: CalendarCheck, title: "Appointment Booking", desc: "AI agents schedule site visits directly into your calendar with automatic confirmations and reminders.", color: "#10b981" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time KPIs, call outcome charts, conversion funnels, and cost-per-lead metrics at a glance.", color: "#f59e0b" },
  { icon: Globe, title: "Multi-Language", desc: "Support for Urdu, English, Punjabi, and more — with natural voice synthesis for local markets.", color: "#06b6d4" },
  { icon: Shield, title: "Multi-Tenant", desc: "Role-based access, team management, and isolated data for agencies with multiple branches.", color: "#0b5b9a" },
  { icon: PhoneForwarded, title: "Number Management", desc: "Provision local and toll-free numbers, configure inbound/outbound AI, and set business hours.", color: "#ec4899" },
];

const steps = [
  { num: "01", title: "Import Your Clients", desc: "Upload CSV or connect your CRM. We'll organize contacts into smart lists ready for campaigns." },
  { num: "02", title: "Configure AI Agent", desc: "Pick a voice, set the language, customize the greeting and system prompt for your market." },
  { num: "03", title: "Launch Campaign", desc: "Select a client list, set concurrency and call hours, then let the AI make thousands of calls." },
  { num: "04", title: "Close Deals", desc: "Review hot leads, listen to recordings, and book site visits — all from one dashboard." },
];

const stats = [
  { value: 2500000, suffix: "+", label: "Calls Made", prefix: "" },
  { value: 98, suffix: "%", label: "Uptime", prefix: "" },
  { value: 340, suffix: "+", label: "Agencies", prefix: "" },
  { value: 45, suffix: "s", label: "Avg Response", prefix: "<" },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "CEO, Premier Properties",
    text: "VoiceEstate transformed our outreach. We went from 50 calls a day to 2,000 — and our conversion rate actually improved by 3x.",
    img: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGJ1c2luZXNzJTIwd29tYW58ZW58MXx8fHwxNzcyNDAyNjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    role: "Director, Urban Realty Group",
    text: "The AI agent handles initial screening perfectly. My team only talks to genuinely interested buyers now. Game changer.",
    img: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGJ1c2luZXNzJTIwbWFuJTIwc3VpdHxlbnwxfHx8fDE3NzI0NDAzOTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 5,
  },
  {
    name: "Amira Patel",
    role: "VP Sales, GlobalHome",
    text: "Multi-language support was a must for us. The Urdu voice agent sounds incredibly natural — clients can't tell it's AI.",
    img: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFuJTIwZW50cmVwcmVuZXVyfGVufDF8fHx8MTc3MjQ1OTQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    desc: "Perfect for solo agents getting started with AI calling.",
    features: ["500 AI calls/month", "1 AI agent", "2 phone numbers", "Basic analytics", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/mo",
    desc: "For growing teams that need more power and flexibility.",
    features: ["5,000 AI calls/month", "All 6 AI agents", "10 phone numbers", "Advanced analytics", "Priority support", "Custom voice & prompts", "CRM integration"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agencies and enterprises with unlimited ambitions.",
    features: ["Unlimited AI calls", "Custom AI agents", "Unlimited numbers", "White-label option", "Dedicated account manager", "SLA guarantee", "API access", "Multi-tenant"],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  { q: "How does the AI voice agent sound?", a: "Our agents use state-of-the-art neural text-to-speech from VAPI. They sound incredibly natural with proper intonation, pauses, and conversational flow. Most recipients can't distinguish them from human callers." },
  { q: "Can I use my own phone numbers?", a: "Yes! You can port existing numbers or provision new local and toll-free numbers directly from the dashboard. Each number can be configured with its own AI agent and settings." },
  { q: "Is there a free trial?", a: "Absolutely. Every plan comes with a 14-day free trial including 100 AI calls. No credit card required to get started." },
  { q: "How does lead scoring work?", a: "Our AI analyzes conversation patterns, keywords, sentiment, and engagement duration to automatically classify leads as Hot, Warm, or Cold — giving your sales team laser focus." },
  { q: "Can I integrate with my existing CRM?", a: "Yes, we offer native integrations with Salesforce, HubSpot, Zoho, and more. Plus our REST API lets you connect any system." },
];

/* ─────────── AnimatedCounter ─────────── */
function AnimatedCounter({ target, suffix, prefix }: { target: number; suffix: string; prefix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = prefix + (target > 999 ? Math.floor(obj.val).toLocaleString() : Math.floor(obj.val).toString()) + suffix;
          },
        });
      },
    });
  }, [target, suffix, prefix]);
  return <span ref={ref}>0</span>;
}

/* ─────────── Landing Page ─────────── */
export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Hero ── */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".hero-badge", { y: 30, opacity: 0, duration: 0.7 })
        .from(".hero-title span", { y: 80, opacity: 0, stagger: 0.12, duration: 0.8 }, "-=0.4")
        .from(".hero-desc", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-cta", { y: 30, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.3")
        .from(".hero-dashboard", { y: 60, opacity: 0, scale: 0.95, duration: 1 }, "-=0.3")
        .from(".hero-float", { y: 20, opacity: 0, stagger: 0.15, duration: 0.6 }, "-=0.6");

      /* floating animation */
      gsap.to(".hero-float-1", { y: -12, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.to(".hero-float-2", { y: 10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.5 });
      gsap.to(".hero-float-3", { y: -8, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });

      /* ── Features ── */
      gsap.fromTo(".feat-head", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: featRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.7 });
      gsap.fromTo(".feat-card",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: featRef.current, start: "top 75%" }, y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
      );

      /* ── Steps ── */
      gsap.fromTo(".step-head", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: stepsRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.7 });
      gsap.fromTo(".step-item",
        { x: -40, opacity: 0 },
        { scrollTrigger: { trigger: stepsRef.current, start: "top 70%" }, x: 0, opacity: 1, stagger: 0.2, duration: 0.7 },
      );
      gsap.fromTo(".step-line",
        { scaleY: 0 },
        { scrollTrigger: { trigger: stepsRef.current, start: "top 65%" }, scaleY: 1, transformOrigin: "top", duration: 1.5, ease: "power2.inOut" },
      );

      /* ── Stats ── */
      gsap.fromTo(".stat-card",
        { y: 40, opacity: 0 },
        { scrollTrigger: { trigger: statsRef.current, start: "top 85%" }, y: 0, opacity: 1, stagger: 0.15, duration: 0.6 },
      );

      /* ── Testimonials ── */
      gsap.fromTo(".test-head", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: testRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.7 });
      gsap.fromTo(".test-card",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: testRef.current, start: "top 75%" }, y: 0, opacity: 1, stagger: 0.15, duration: 0.6 },
      );

      /* ── Pricing ── */
      gsap.fromTo(".price-head", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: pricingRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.7 });
      gsap.fromTo(".price-card",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: pricingRef.current, start: "top 75%" }, y: 0, opacity: 1, stagger: 0.15, duration: 0.6 },
      );

      /* ── FAQ ── */
      gsap.fromTo(".faq-head", { y: 40, opacity: 0 }, { scrollTrigger: { trigger: faqRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.7 });
      gsap.fromTo(".faq-item",
        { y: 30, opacity: 0 },
        { scrollTrigger: { trigger: faqRef.current, start: "top 75%" }, y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
      );

      /* ── CTA ── */
      gsap.fromTo(".cta-content",
        { y: 50, opacity: 0 },
        { scrollTrigger: { trigger: ctaRef.current, start: "top 85%" }, y: 0, opacity: 1, duration: 0.8 },
      );

      /* ── Navbar ── */
      ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
          if (navRef.current) {
            if (self.direction === 1 && self.scroll() > 80) {
              navRef.current.classList.add("shadow-lg", "border-b", "border-border");
              navRef.current.style.backdropFilter = "blur(20px)";
              navRef.current.style.background = "rgba(255,255,255,0.85)";
            }
            if (self.scroll() <= 80) {
              navRef.current.classList.remove("shadow-lg", "border-b", "border-border");
              navRef.current.style.backdropFilter = "";
              navRef.current.style.background = "";
            }
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ────── NAVBAR ────── */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center shadow-lg shadow-[#1a8ee9]/25">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl text-[#0f172a]" style={{ fontWeight: 600 }}>VoiceEstate</span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, "-"))} className="text-sm text-[#64748b] hover:text-[#0f172a] transition-colors">
                  {item}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => navigate("/signin")} className="text-sm text-[#64748b] hover:text-[#0f172a] transition-colors px-4 py-2">
                Sign In
              </button>
              <button onClick={() => navigate("/signup")} className="text-sm text-white bg-[#1a8ee9] hover:bg-[#0b5b9a] transition-colors px-5 py-2.5 rounded-[5px] shadow-lg shadow-[#1a8ee9]/25">
                Get Started Free
              </button>
            </div>
            <button className="lg:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden bg-white border-t border-border px-4 pb-4 shadow-lg">
            {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, "-"))} className="block w-full text-left py-3 text-sm text-[#64748b] hover:text-[#0f172a] border-b border-border/50">
                {item}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-3">
              <button onClick={() => { navigate("/signin"); setMobileMenu(false); }} className="text-sm text-center py-2.5 text-[#64748b] border border-border rounded-[5px]">Sign In</button>
              <button onClick={() => { navigate("/signup"); setMobileMenu(false); }} className="text-sm text-center py-2.5 text-white bg-[#1a8ee9] rounded-[5px]">Get Started Free</button>
            </div>
          </div>
        )}
      </nav>

      {/* ────── HERO ──��─── */}
      <section ref={heroRef} className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* bg blurs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#1a8ee9]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#1a8ee9]" />
            <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Powered by VAPI AI Voice Technology</span>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl tracking-tight text-[#0f172a] max-w-5xl mx-auto leading-[1.1]" style={{ fontWeight: 700 }}>
            <span className="block">AI That Calls,</span>
            <span className="block">Qualifies &amp; Books</span>
            <span className="block text-[#1a8ee9]">Real Estate Leads</span>
          </h1>

          <p className="hero-desc text-base lg:text-lg text-[#64748b] max-w-2xl mx-auto mt-6 leading-relaxed">
            Replace cold-calling teams with AI voice agents that make thousands of calls, qualify leads in real time, and book site visits — all while you focus on closing deals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button onClick={() => navigate("/signup")} className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white px-7 py-3.5 rounded-[5px] text-sm shadow-xl shadow-[#1a8ee9]/25 transition-all hover:shadow-[#0b5b9a]/30" style={{ fontWeight: 500 }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] text-[#0f172a] px-7 py-3.5 rounded-[5px] text-sm hover:bg-[#f8fafc] transition-all" style={{ fontWeight: 500 }}>
              <Play className="w-4 h-4 text-[#1a8ee9]" /> Watch Demo
            </button>
          </div>

          {/* Dashboard mockup */}
          <div className="hero-dashboard relative mt-16 lg:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-[8px] border border-[#e2e8f0] shadow-2xl shadow-[#0f172a]/10 overflow-hidden bg-[#f8fafc]">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-[#e2e8f0]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#f1f5f9] rounded-[5px] px-4 py-1 text-xs text-[#94a3b8] max-w-xs w-full text-center">app.voiceestate.com/dashboard</div>
                </div>
              </div>
              {/* Dashboard simulation */}
              <div className="p-4 lg:p-6 grid grid-cols-6 gap-3 lg:gap-4">
                {/* Sidebar mini */}
                <div className="hidden lg:flex flex-col gap-2 col-span-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-[5px] bg-[#1a8ee9]" />
                    <div className="h-2 bg-[#e2e8f0] rounded w-16" />
                  </div>
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-[5px] ${i === 0 ? "bg-[#1a8ee9]" : "bg-[#f1f5f9]"}`} />
                  ))}
                </div>
                {/* Main content */}
                <div className="col-span-6 lg:col-span-5 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["#1a8ee9", "#8b5cf6", "#10b981", "#f59e0b"].map((c, i) => (
                      <div key={i} className="bg-white rounded-[5px] border border-[#e2e8f0] p-3">
                        <div className="w-8 h-8 rounded-[5px] mb-2" style={{ backgroundColor: c + "15" }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                          </div>
                        </div>
                        <div className="h-5 bg-[#0f172a] rounded w-12 mb-1" />
                        <div className="h-2 bg-[#e2e8f0] rounded w-16" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 bg-white rounded-[5px] border border-[#e2e8f0] p-4 h-32 lg:h-40">
                      <div className="h-2 bg-[#e2e8f0] rounded w-24 mb-4" />
                      <div className="flex items-end gap-1.5 h-16 lg:h-24">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-[3px] bg-[#1a8ee9]" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-[5px] border border-[#e2e8f0] p-4 h-32 lg:h-40 flex items-center justify-center">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-[6px] border-[#1a8ee9] border-t-[#e2e8f0] border-r-[#10b981]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="hero-float hero-float-1 absolute -left-4 lg:-left-12 top-1/3 bg-white rounded-[5px] shadow-xl border border-[#e2e8f0] p-3 hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-[5px] bg-[#10b981]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Conversion Rate</p>
                <p className="text-sm text-[#0f172a]" style={{ fontWeight: 600 }}>+34.2%</p>
              </div>
            </div>

            <div className="hero-float hero-float-2 absolute -right-4 lg:-right-12 top-1/4 bg-white rounded-[5px] shadow-xl border border-[#e2e8f0] p-3 hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-[5px] bg-[#1a8ee9]/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#1a8ee9]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Calls Today</p>
                <p className="text-sm text-[#0f172a]" style={{ fontWeight: 600 }}>2,847</p>
              </div>
            </div>

            <div className="hero-float hero-float-3 absolute right-8 lg:right-16 -bottom-4 bg-white rounded-[5px] shadow-xl border border-[#e2e8f0] p-3 hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-[5px] bg-[#ef4444]/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Hot Leads</p>
                <p className="text-sm text-[#0f172a]" style={{ fontWeight: 600 }}>18 New</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── TRUSTED BY ────── */}
      <section className="py-12 lg:py-16 border-y border-[#f1f5f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-8" style={{ fontWeight: 500 }}>Trusted by 340+ real estate agencies worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40">
            {["Premier Properties", "Urban Realty", "GlobalHome", "Skyline Estates", "Metro Brokers", "CityLiving"].map((n) => (
              <span key={n} className="text-lg lg:text-xl text-[#0f172a]" style={{ fontWeight: 700 }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <section id="features" ref={featRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="feat-head text-center max-w-2xl mx-auto mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-[#1a8ee9]" />
              <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Powerful Features</span>
            </div>
            <h2 className="text-3xl lg:text-5xl text-[#0f172a] tracking-tight" style={{ fontWeight: 700 }}>
              Everything You Need to Scale
            </h2>
            <p className="text-[#64748b] mt-4 text-base lg:text-lg">
              From AI voice agents to analytics — a complete platform built for modern real estate teams.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((f, i) => (
              <div key={i} className="feat-card group bg-white rounded-[5px] border border-[#e2e8f0] p-5 lg:p-6 hover:shadow-xl hover:border-[#1a8ee9]/20 hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="w-11 h-11 rounded-[5px] flex items-center justify-center mb-4" style={{ backgroundColor: f.color + "12" }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-base text-[#0f172a] mb-2" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── HOW IT WORKS ────── */}
      <section id="how-it-works" ref={stepsRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="step-head text-center max-w-2xl mx-auto mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
              <Settings className="w-3.5 h-3.5 text-[#1a8ee9]" />
              <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Simple Process</span>
            </div>
            <h2 className="text-3xl lg:text-5xl text-[#0f172a] tracking-tight" style={{ fontWeight: 700 }}>
              From Setup to Closed Deals
            </h2>
            <p className="text-[#64748b] mt-4 text-base lg:text-lg">
              Get started in minutes, not months. Four simple steps to AI-powered real estate growth.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="step-line absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-[#1a8ee9] hidden sm:block" />
            <div className="space-y-8 lg:space-y-12">
              {steps.map((s, i) => (
                <div key={i} className="step-item flex gap-5 lg:gap-8 items-start">
                  <div className="relative z-10 w-12 h-12 lg:w-16 lg:h-16 rounded-[5px] bg-white border-2 border-[#1a8ee9] flex items-center justify-center shrink-0 shadow-lg shadow-[#1a8ee9]/10">
                    <span className="text-base lg:text-lg text-[#1a8ee9]" style={{ fontWeight: 700 }}>{s.num}</span>
                  </div>
                  <div className="bg-white rounded-[5px] border border-[#e2e8f0] p-5 lg:p-6 flex-1 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg text-[#0f172a] mb-2" style={{ fontWeight: 600 }}>{s.title}</h3>
                    <p className="text-sm text-[#64748b] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────── STATS ────── */}
      <section ref={statsRef} className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#1a8ee9]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="stat-card text-center">
                <p className="text-3xl lg:text-5xl text-white mb-2" style={{ fontWeight: 700 }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                </p>
                <p className="text-sm text-[#94a3b8]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── TESTIMONIALS ────── */}
      <section ref={testRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="test-head text-center max-w-2xl mx-auto mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-[#1a8ee9]" />
              <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Testimonials</span>
            </div>
            <h2 className="text-3xl lg:text-5xl text-[#0f172a] tracking-tight" style={{ fontWeight: 700 }}>
              Loved by Real Estate Teams
            </h2>
            <p className="text-[#64748b] mt-4 text-base lg:text-lg">
              See how agencies worldwide are closing more deals with AI-powered calling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="test-card bg-white rounded-[5px] border border-[#e2e8f0] p-6 lg:p-7 hover:shadow-xl hover:border-[#1a8ee9]/20 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-sm text-[#475569] leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <ImageWithFallback src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm text-[#0f172a]" style={{ fontWeight: 600 }}>{t.name}</p>
                    <p className="text-xs text-[#94a3b8]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── PRICING ────── */}
      <section id="pricing" ref={pricingRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="price-head text-center max-w-2xl mx-auto mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-[#1a8ee9]" />
              <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>Pricing</span>
            </div>
            <h2 className="text-3xl lg:text-5xl text-[#0f172a] tracking-tight" style={{ fontWeight: 700 }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#64748b] mt-4 text-base lg:text-lg">
              Start free, scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((p, i) => (
              <div key={i} className={`price-card relative bg-white rounded-[5px] border p-6 lg:p-8 transition-all duration-300 hover:shadow-xl ${p.popular ? "border-[#1a8ee9] shadow-xl shadow-[#1a8ee9]/10 scale-[1.02]" : "border-[#e2e8f0] hover:border-[#1a8ee9]/30"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a8ee9] text-white text-xs px-4 py-1 rounded-full" style={{ fontWeight: 500 }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg text-[#0f172a] mb-1" style={{ fontWeight: 600 }}>{p.name}</h3>
                <p className="text-xs text-[#94a3b8] mb-5">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl text-[#0f172a]" style={{ fontWeight: 700 }}>{p.price}</span>
                  {p.period && <span className="text-sm text-[#94a3b8]">{p.period}</span>}
                </div>
                <button
                  onClick={() => navigate("/signup")}
                  className={`w-full py-3 rounded-[5px] text-sm transition-all ${
                    p.popular
                      ? "bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white shadow-lg shadow-[#1a8ee9]/20"
                      : "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a]"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {p.cta}
                </button>
                <div className="mt-6 space-y-3">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1a8ee9] shrink-0" />
                      <span className="text-sm text-[#475569]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── FAQ ────── */}
      <section id="faq" ref={faqRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="faq-head text-center mb-14 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#1a8ee9]/5 border border-[#1a8ee9]/20 rounded-full px-4 py-1.5 mb-4">
              <HelpCircleIcon />
              <span className="text-xs text-[#1a8ee9]" style={{ fontWeight: 500 }}>FAQ</span>
            </div>
            <h2 className="text-3xl lg:text-5xl text-[#0f172a] tracking-tight" style={{ fontWeight: 700 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="faq-item border border-[#e2e8f0] rounded-[5px] overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  <span className="text-sm text-[#0f172a] pr-4" style={{ fontWeight: 500 }}>{f.q}</span>
                  <ChevronRight className={`w-4 h-4 text-[#94a3b8] shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "200px" : "0px", opacity: openFaq === i ? 1 : 0 }}
                >
                  <p className="px-5 pb-5 text-sm text-[#64748b] leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section ref={ctaRef} className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="cta-content max-w-4xl mx-auto relative overflow-hidden rounded-[8px] bg-[#0f172a] p-10 lg:p-16 text-center">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1a8ee9]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#8b5cf6]/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl text-white tracking-tight mb-4" style={{ fontWeight: 700 }}>
              Ready to 10x Your Real Estate Calls?
            </h2>
            <p className="text-[#94a3b8] text-base lg:text-lg max-w-2xl mx-auto mb-8">
              Join 340+ agencies already using VoiceEstate to close more deals with AI. Start your free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => navigate("/signup")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white px-8 py-3.5 rounded-[5px] text-sm shadow-xl shadow-[#1a8ee9]/30 transition-all" style={{ fontWeight: 500 }}>
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-[5px] text-sm hover:bg-white/5 transition-all" style={{ fontWeight: 500 }}>
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer className="border-t border-[#e2e8f0] bg-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center">
                  <Headphones className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-lg text-[#0f172a]" style={{ fontWeight: 600 }}>VoiceEstate</span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed max-w-xs">
                AI-powered voice calling platform built for real estate professionals.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Integrations", "API Docs"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Resources", links: ["Documentation", "Help Center", "Community", "Status"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs text-[#0f172a] uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>{col.title}</p>
                <div className="space-y-2.5">
                  {col.links.map((l) => (
                    <p key={l} className="text-sm text-[#64748b] hover:text-[#1a8ee9] cursor-pointer transition-colors">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#94a3b8]">&copy; 2026 VoiceEstate. All rights reserved.</p>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <span key={s} className="text-xs text-[#94a3b8] hover:text-[#1a8ee9] cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HelpCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a8ee9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}