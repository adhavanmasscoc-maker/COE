"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  GraduationCap, 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  Menu, 
  X,
  LogOut,
  UserCheck,
  BookOpen,
  Layers,
  Calendar,
  Award,
  Users
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const isExamMode = pathname?.includes("/exam-mock");

  // Fetch current session on mount and route changes
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        setCurrentUser(null);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // In real exam mode, hide standard navigation for distraction-free focus!
  if (isExamMode) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Portal Home", icon: GraduationCap },
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/syllabus", label: "Syllabus", icon: BookOpen },
    { href: "/student/papers", label: "Question Papers", icon: FileText },
    { href: "/student/results", label: "Marksheet", icon: Award },
    { href: "/coe-admin/dashboard", label: "COE Control", icon: ShieldCheck },
    { href: "/coe-admin/students", label: "Students", icon: Users },
    { href: "/coe-admin/exams", label: "Exam Schedules", icon: Calendar },
    { href: "/coe-admin/results", label: "Marks Entry", icon: Award },
    { href: "/coe-admin/syllabus", label: "Syllabus Mgr", icon: Layers },
    { href: "/coe-admin/papers", label: "Papers Mgr", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/85 border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-foreground">
                  SAMACHEER KALVI
                </span>
                <Badge variant="success" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                  COE Verified
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Controller of Examinations Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right utility items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Session Status */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-card border border-border text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-foreground">
                      {currentUser.fullName || currentUser.username}
                    </span>
                    {currentUser.role === "STUDENT" && (
                      <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                        ({currentUser.examPrepClass}th Prep)
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1 text-xs py-1 px-2.5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
                  title="Log out of current session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-400">Class 10 & 12 Prep Ready</span>
              </div>
            )}

            <ThemeToggle />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl md:hidden border border-border text-foreground hover:bg-secondary"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-4 space-y-2">
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-secondary/80 border border-border flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-foreground">{currentUser.fullName || currentUser.username}</span>
              <Badge variant="purple">{currentUser.role}</Badge>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {currentUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full justify-center text-rose-400 border-rose-500/30 hover:bg-rose-500/10 gap-1.5 mt-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
