import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Phone,
  Settings,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardMainNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/phone-numbers", label: "Phone Numbers", icon: Phone },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export const dashboardSettingsNavItem: DashboardNavItem = {
  href: "/dashboard/settings",
  label: "Settings",
  icon: Settings,
};

/** @deprecated Prefer `dashboardMainNavItems` + `dashboardSettingsNavItem`. */
export const dashboardNavItems: DashboardNavItem[] = [
  ...dashboardMainNavItems,
  dashboardSettingsNavItem,
];

export type BreadcrumbSegment = { label: string; href?: string };

const pathMeta: Record<string, { title: string; crumbs: BreadcrumbSegment[] }> =
  {
    "/dashboard": {
      title: "Dashboard",
      crumbs: [{ label: "Overview" }],
    },
    "/dashboard/campaigns": {
      title: "Campaigns",
      crumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Campaigns" }],
    },
    "/dashboard/phone-numbers": {
      title: "Phone Numbers",
      crumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Phone Numbers" },
      ],
    },
    "/dashboard/billing": {
      title: "Billing",
      crumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Billing" },
      ],
    },
    "/dashboard/settings": {
      title: "Settings",
      crumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ],
    },
  };

export function getDashboardPageMeta(pathname: string): {
  title: string;
  crumbs: BreadcrumbSegment[];
} {
  if (pathname === "/dashboard/campaigns/new") {
    return {
      title: "New campaign",
      crumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Campaigns", href: "/dashboard/campaigns" },
        { label: "New campaign" },
      ],
    };
  }
  const campaignDetail = pathname.match(/^\/dashboard\/campaigns\/([^/]+)$/);
  if (campaignDetail && campaignDetail[1] !== "new") {
    return {
      title: "Campaign",
      crumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Campaigns", href: "/dashboard/campaigns" },
        { label: "Detail" },
      ],
    };
  }
  return pathMeta[pathname] ?? pathMeta["/dashboard"];
}
