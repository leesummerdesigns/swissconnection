"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Menu, User, LogOut, MessageSquare, Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProvider, setIsProvider] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchRole = useCallback(async () => {
    try {
      const userId = (session?.user as any)?.id;
      if (!userId) return;
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setIsProvider(data.role === "PROVIDER");
      }
    } catch {
      // silently fail
    }
  }, [session]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchUnread();
    fetchRole();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [status, fetchUnread, fetchRole]);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-nav">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_swissconnection.svg"
              alt="The Swiss Connection"
              width={140}
              height={25}
              className="h-[18px] md:h-[25px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <LanguageSwitcher />
            {!isProvider && (
              <Link
                href="/provider/setup"
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Search size={18} />
                <span>{t("provideServices")}</span>
              </Link>
            )}

            {status === "authenticated" && session?.user ? (
              <>
                <Link
                  href="/messages"
                  className="relative flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>{t("messages")}</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-surface-border hover:shadow-card transition-all"
                  >
                    <Menu size={16} />
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-medium">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-card shadow-modal border border-surface-border py-2">
                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-secondary"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User size={16} />
                        {t("profile")}
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-secondary"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <MessageSquare size={16} />
                        {t("messages")}
                        {unreadCount > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                      <hr className="my-1 border-surface-border" />
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          signOut();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface-secondary"
                      >
                        <LogOut size={16} />
                        {t("signOut")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-text text-sm">
                  {t("signIn")}
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  {t("signUp")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile icons */}
          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              className="p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Account menu"
            >
              {status === "authenticated" && session?.user ? (
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-medium">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              ) : (
                <User size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-surface-border">
            {!isProvider && (
              <Link
                href="/provider/setup"
                className="block py-2.5 text-text-secondary hover:text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("provideServices")}
              </Link>
            )}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 py-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("messages")}
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile/edit"
                  className="block py-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("profile")}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="block w-full text-left py-2.5 text-text-secondary hover:text-text-primary"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/register"
                  className="block py-2.5 text-brand-500 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("signUp")}
                </Link>
              </>
            )}
            <div className="py-2.5">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
