import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { SidebarNav } from "./sidebar-nav";
import { Bell, Search, User, Settings, LogOut, HelpCircle, CreditCard, UserCircle, X, Megaphone, Target, CalendarCheck, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Toaster, toast } from "sonner";
import { useAuth } from "../auth";

const mockNotifications = [
  { id: "1", title: "New Hot Lead", description: "Ahmed Khan showed interest in DHA Phase 5", time: "2 min ago", read: false, icon: Target, color: "text-red-500" },
  { id: "2", title: "Campaign Completed", description: "Giga Mall Investor Outreach finished all calls", time: "15 min ago", read: false, icon: Megaphone, color: "text-[#1a8ee9]" },
  { id: "3", title: "Appointment Booked", description: "Site visit scheduled with Usman Tariq", time: "1 hr ago", read: false, icon: CalendarCheck, color: "text-[#1a8ee9]" },
  { id: "4", title: "New Lead Generated", description: "Sara Ali from Giga Mall campaign", time: "2 hrs ago", read: true, icon: Target, color: "text-orange-500" },
  { id: "5", title: "Campaign Paused", description: "Blue World City Revival was auto-paused", time: "3 hrs ago", read: true, icon: Megaphone, color: "text-amber-500" },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast("Notification dismissed");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Toaster position="top-right" richColors />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown in overlay */}
      <div className={`hidden lg:block`}>
        <SidebarNav />
      </div>
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 lg:h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              className="lg:hidden p-2 rounded-[5px] hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-3 bg-muted/60 rounded-[5px] px-3 py-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients, campaigns..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Mobile search */}
            <button className="sm:hidden p-2 rounded-[5px] hover:bg-muted transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-[5px] hover:bg-muted transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#1a8ee9] rounded-full flex items-center justify-center text-[10px] text-white px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[340px] sm:w-[380px]">
                <div className="flex items-center justify-between px-2 py-2">
                  <DropdownMenuLabel className="text-sm">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#1a8ee9] hover:text-[#0b5b9a] hover:underline px-2 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !n.read ? "bg-[#1a8ee9]/5" : ""
                        }`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className={`mt-0.5 ${n.color}`}>
                          <n.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm truncate">{n.title}</p>
                            {!n.read && (
                              <span className="w-2 h-2 bg-[#1a8ee9] rounded-full shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                          className="p-1 hover:bg-accent rounded shrink-0"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 lg:gap-3 hover:bg-muted rounded-[5px] px-2 py-1.5 transition-colors">
                  <div className="text-right hidden md:block">
                    <p className="text-sm">
                      {user?.company || "Realty Corp"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@realtycorp.pk"}
                    </p>
                  </div>
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-[5px] bg-[#1a8ee9] flex items-center justify-center shadow-md shadow-[#1a8ee9]/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="text-sm">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@realtycorp.pk"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => { navigate("/dashboard/settings"); setMobileOpen(false); }}>
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate("/dashboard/settings"); setMobileOpen(false); }}>
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate("/dashboard/settings"); setMobileOpen(false); }}>
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { navigate("/dashboard/help"); setMobileOpen(false); }}>
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    logout();
                    toast.info("Logged out successfully");
                    navigate("/signin");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}