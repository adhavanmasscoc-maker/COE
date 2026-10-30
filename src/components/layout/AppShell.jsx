"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  CalendarDays,
  ShieldCheck,
  Layers,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  Moon,
  Sun,
  Users,
  ClipboardList,
  Zap,
  FileJson,
  Activity,
  FolderArchive,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { ActivityTracker } from "@/components/telemetry/ActivityTracker";
import { useTheme } from "@/components/theme/ThemeProvider";

// ─── Auth Context ──────────────────────────────────────────────────────
const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

// ─── Nav config ───────────────────────────────────────────────────────
const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/syllabus",  label: "Syllabus",  icon: BookOpen },
  { href: "/student/papers",    label: "Papers",    icon: FileText },
  { href: "/student/results",   label: "Results",   icon: Award },
];

const adminNav = [
  { href: "/coe-admin/dashboard",    label: "Overview",            icon: LayoutDashboard },
  { href: "/coe-admin/curriculum",   label: "Curriculum Archive",  icon: FolderArchive },
  { href: "/coe-admin/ai-questions", label: "AI Exam Setter",      icon: Sparkles },
  { href: "/coe-admin/history",      label: "History & Clicks",    icon: Activity },
  { href: "/coe-admin/students",     label: "Students",            icon: Users },
  { href: "/coe-admin/exams",        label: "Exams",               icon: CalendarDays },
  { href: "/coe-admin/exam-setter",  label: "Exam Setter (JSON)",  icon: Zap },
  { href: "/coe-admin/syllabus",     label: "Syllabus",            icon: Layers },
  { href: "/coe-admin/papers",       label: "Papers",              icon: ClipboardList },
  { href: "/coe-admin/results",      label: "Marks",               icon: Award },
  { href: "/coe-admin/import",       label: "JSON Import",         icon: FileJson },
];

// Quick bottom-nav items for mobile screens
const adminMobileBottomNav = [
  { href: "/coe-admin/dashboard",    label: "Overview",  icon: LayoutDashboard },
  { href: "/coe-admin/ai-questions", label: "AI Setter", icon: Sparkles },
  { href: "/coe-admin/exams",        label: "Exams",     icon: CalendarDays },
  { href: "/coe-admin/students",     label: "Students",  icon: Users },
];

const studentMobileBottomNav = [
  { href: "/student/dashboard", label: "Home",     icon: LayoutDashboard },
  { href: "/student/syllabus",  label: "Syllabus", icon: BookOpen },
  { href: "/student/papers",    label: "Papers",   icon: FileText },
  { href: "/student/results",   label: "Results",  icon: Award },
];

// ─── Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ user, open, onClose, onLogout }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";
  const navLinks = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${open ? "open z-50" : ""}`}
        aria-label="Navigation Sidebar"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 mb-6">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0d0d1a] dot-live" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-foreground tracking-tight">Aknex COE</div>
            <div className="text-[10px] text-muted-foreground font-medium">Exam Portal</div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto md:hidden touch-target p-2 rounded-lg hover:bg-white/5 text-muted-foreground"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        {user && (
          <div className="mb-4 px-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/80 border border-border">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isAdmin
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-violet-500/20 text-violet-300"
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {isAdmin ? "Controller of Examinations" : `Roll: ${user.username}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section label */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          {isAdmin ? "Administration" : "My Portal"}
        </p>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {user ? (
            navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`sidebar-link min-h-[44px] flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary/20 text-primary-foreground border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="sidebar-icon w-4 h-4 flex-shrink-0 mr-2.5" />
                  <span>{label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary opacity-80" />
                  )}
                </Link>
              );
            })
          ) : (
            <Link href="/" onClick={onClose} className="sidebar-link min-h-[44px] flex items-center px-3 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          )}
        </nav>

        {/* Bottom actions */}
        {user && (
          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={onLogout}
              className="touch-target w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────
function Topbar({ user, onMenuClick, onLogout }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Breadcrumb from pathname
  const segments = (pathname || "/").split("/").filter(Boolean);
  const crumb = segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" › ");

  return (
    <header className="topbar">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger (mobile drawer toggle) */}
        <button
          onClick={onMenuClick}
          className="md:hidden touch-target p-2 rounded-xl border border-border text-foreground hover:bg-secondary transition-colors"
          aria-label="Open side menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="text-xs sm:text-[0.8125rem] font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-md">
          {crumb || "Home"}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium text-emerald-400">
          <span className="dot-live" />
          Live
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="touch-target p-2.5 rounded-xl border border-border text-foreground hover:bg-secondary transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle visual theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* User avatar chip */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-secondary border border-border text-xs">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px]">
              {(user.fullName || user.username || "?")[0].toUpperCase()}
            </div>
            <span className="font-semibold text-foreground">
              {user.fullName?.split(" ")[0] || user.username}
            </span>
          </div>
        )}

        {/* Logout */}
        {user && (
          <button
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="touch-target p-2.5 rounded-xl border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Mobile Bottom Navigation Bar ─────────────────────────────────────
function MobileBottomNav({ user, onOpenDrawer }) {
  const pathname = usePathname();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const items = isAdmin ? adminMobileBottomNav : studentMobileBottomNav;

  return (
    <nav className="bottom-nav md:hidden" aria-label="Mobile Navigation Bar">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item ${isActive ? "active text-amber-400 dark:text-amber-300 font-bold" : ""}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-amber-400 dark:text-amber-300 scale-110" : "text-muted-foreground"}`} />
            <span>{label}</span>
          </Link>
        );
      })}

      {/* More / Full Drawer Trigger */}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="bottom-nav-item"
        aria-label="Open Full Menu"
      >
        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        <span>Menu</span>
      </button>
    </nav>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────
export function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const isExamMode = pathname?.includes("/exam-mock");
  const isPublicPage = pathname === "/" || pathname?.startsWith("/api");

  // Fetch session
  useEffect(() => {
    setHydrated(true);
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  // In exam mode — completely clean, zero chrome for proctored security
  if (isExamMode) {
    return (
      <AuthContext.Provider value={user}>
        {user?.role === "STUDENT" && (
          <ActivityTracker studentRollNo={user.username} studentName={user.fullName} />
        )}
        <div className="min-h-screen bg-background text-foreground">{children}</div>
      </AuthContext.Provider>
    );
  }

  // Public/landing page — no sidebar
  if (isPublicPage || !user) {
    return (
      <AuthContext.Provider value={user}>
        <div className="min-h-screen flex flex-col bg-background text-foreground">{children}</div>
      </AuthContext.Provider>
    );
  }

  // Authenticated layout with sidebar on desktop & bottom-nav on mobile
  return (
    <AuthContext.Provider value={user}>
      {user?.role === "STUDENT" && (
        <ActivityTracker studentRollNo={user.username} studentName={user.fullName} />
      )}
      <div className="app-layout bg-background text-foreground">
        <Sidebar
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <div className="main-content flex flex-col min-h-screen w-full">
          <Topbar
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={handleLogout}
          />
          <main className="flex-1 w-full flex flex-col items-center pb-20 md:pb-6 overflow-x-hidden">
            {children}
          </main>
          {/* Native Mobile Bottom Navigation Bar */}
          <MobileBottomNav user={user} onOpenDrawer={() => setSidebarOpen(true)} />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
