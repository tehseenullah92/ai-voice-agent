import { Headphones, Phone, Bot, BarChart3, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Logo } from "./ui/logo";

const features = [
  { icon: Bot, text: "AI Voice Agents that call, qualify & book leads 24/7" },
  { icon: Phone, text: "Make thousands of calls simultaneously" },
  { icon: BarChart3, text: "Real-time analytics & conversion tracking" },
  { icon: Shield, text: "Enterprise-grade security & multi-tenant support" },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-[#0f172a] flex-col justify-between p-10 xl:p-12 relative overflow-hidden shrink-0">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1a8ee9]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#1a8ee9]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2.5 mb-16"
          >
            <Logo />
          </button>

          {/* Tagline */}
          <h1
            className="text-3xl xl:text-4xl text-white leading-tight mb-4"
            style={{ fontWeight: 700 }}
          >
            AI-Powered Calling
            <br />
            for Real Estate
          </h1>
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-10 max-w-sm">
            Join 340+ agencies using Convaire to automate outreach, qualify
            leads, and book site visits with AI voice agents.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[5px] bg-[#1a8ee9]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-[#1a8ee9]" />
                </div>
                <p className="text-sm text-[#cbd5e1] leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#1a8ee9]" />
            <span className="text-xs text-[#64748b]">
              Trusted by 340+ agencies worldwide
            </span>
          </div>
          <div className="flex gap-4 opacity-40">
            {["Premier Properties", "Urban Realty", "GlobalHome"].map((n) => (
              <span
                key={n}
                className="text-xs text-white"
                style={{ fontWeight: 600 }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 bg-[#f8fafc]">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2.5"
            >
              <Logo dark={true} />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
