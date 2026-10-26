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
} from "lucide-react";

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
  { href: "/coe-admin/dashboard", label: "Overview",    icon: LayoutDashboard },
  { href: "/coe-admin/students",  label: "Students",    icon: Users },
  { href: "/coe-admin/exams",     label: "Exams",       icon: CalendarDays },
  { href: "/coe-admin/syllabus",  label: "Syllabus",    icon: Layers },
  { href: "/coe-admin/papers",    label: "Papers",      icon: ClipboardList },
  { href: "/coe-admin/results",   label: "Marks",       icon: Award },
  { href: "/coe-admin/import",    label: "JSON Import", icon: FileJson },
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 mb-6">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#0d0d1a] dot-live" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-[#f0f0ff] tracking-tight">Aknex COE</div>
            <div className="text-[10px] text-[#5c5c8a] font-medium">Exam Portal</div>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto md:hidden p-1 rounded-lg hover:bg-white/5 text-[#5c5c8a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        {user && (
          <div className="mb-4 px-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl glass-sm">
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
                <p className="text-xs font-semibold text-[#f0f0ff] truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[10px] text-[#5c5c8a] font-mono">
                  {isAdmin ? "Controller of Examinations" : `Roll: ${user.username}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section label */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5c5c8a] px-2 mb-2">
          {isAdmin ? "Administration" : "My Portal"}
        </p>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {user
            ? navLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || (href !== "/" && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <Icon className="sidebar-icon w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400 opacity-60" />
                    )}
                  </Link>
                );
              })
            : (
              <>
                <Link href="/" onClick={onClose} className="sidebar-link">
                  <Zap className="w-4 h-4" />
                  Sign In
                </Link>
              </>
            )}
        </nav>

        {/* Bottom actions */}
        {user && (
          <div className="mt-auto pt-4 border-t border-[rgba(124,58,237,0.12)]">
            <button
              onClick={onLogout}
              className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
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
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setDark(html.classList.contains("dark"));
  };

  // Breadcrumb from pathname
  const segments = (pathname || "/").split("/").filter(Boolean);
  const crumb = segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" › ");

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl border border-[rgba(124,58,237,0.2)] text-[#a8a8d0] hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="text-[0.8125rem] font-medium text-[#5c5c8a]">
          {crumb || "Home"}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-sm text-[11px] font-medium text-emerald-300">
          <span className="dot-live" />
          Live
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[rgba(124,58,237,0.2)] text-[#a8a8d0] hover:bg-white/5 transition-colors"
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User avatar chip */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl glass-sm text-xs">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              {(user.fullName || user.username || "?")[0].toUpperCase()}
            </div>
            <span className="font-medium text-[#f0f0ff]">
              {user.fullName?.split(" ")[0] || user.username}
            </span>
          </div>
        )}

        {/* Logout */}
        {user && (
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
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
      .then((r) => r.ok ? r.json() : null)
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

  // In exam mode — completely clean, no chrome
  if (isExamMode) {
    return (
      <AuthContext.Provider value={user}>
        <div className="min-h-screen">{children}</div>
      </AuthContext.Provider>
    );
  }

  // Public/landing page — no sidebar
  if (isPublicPage || !user) {
    return (
      <AuthContext.Provider value={user}>
        <div className="min-h-screen flex flex-col">{children}</div>
      </AuthContext.Provider>
    );
  }

  // Authenticated layout with sidebar
  return (
    <AuthContext.Provider value={user}>
      <div className="app-layout">
        <Sidebar
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <div className="main-content flex flex-col min-h-screen">
          <Topbar
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={handleLogout}
          />
          <main className="flex-1 w-full flex flex-col items-center">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
