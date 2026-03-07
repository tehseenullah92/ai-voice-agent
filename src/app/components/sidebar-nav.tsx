import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Target,
  Phone,
  CalendarCheck,
  Settings,
  ListChecks,
  Headphones,
  ChevronLeft,
  ChevronRight,
  PhoneForwarded,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./ui/logo";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/clients", icon: Users, label: "Clients" },
  { to: "/dashboard/client-lists", icon: ListChecks, label: "Client Lists" },
  { to: "/dashboard/campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "/dashboard/leads", icon: Target, label: "Leads" },
  { to: "/dashboard/call-logs", icon: Phone, label: "Call Logs" },
  { to: "/dashboard/phone-numbers", icon: PhoneForwarded, label: "Phone Numbers" },
  { to: "/dashboard/appointments", icon: CalendarCheck, label: "Appointments" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  { to: "/dashboard/help", icon: HelpCircle, label: "Help & Support" },
];

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-sidebar flex flex-col h-full transition-all duration-300 shrink-0 ${collapsed ? "w-[68px]" : "w-[260px]"
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <NavLink to="/home" className="flex items-center gap-3">
          <Logo isCollapsed={collapsed} />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-3 mb-2">
            Main Menu
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[5px] transition-all duration-200 text-sm ${isActive
                ? "bg-[#1a8ee9] text-white shadow-md shadow-[#1a8ee9]/25"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <>
            <div className="h-px bg-sidebar-border my-3" />
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/30 px-3 mb-2">
              Resources
            </p>
            <NavLink
              to="/brand"
              className="flex items-center gap-3 px-3 py-2.5 rounded-[5px] transition-all duration-200 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white"
            >
              <ExternalLink className="w-[18px] h-[18px] shrink-0" />
              <span>Brand Guide</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {!collapsed && (
          <div className="mb-3 mx-1 p-3 rounded-[5px] bg-[#1a8ee9]/10 border border-[#1a8ee9]/20">
            <p className="text-xs text-[#1a8ee9]">Pro Plan Active</p>
            <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">
              2,847 calls remaining
            </p>
            <div className="mt-2 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a8ee9] rounded-full"
                style={{ width: "68%" }}
              />
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-[5px] text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-white transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}