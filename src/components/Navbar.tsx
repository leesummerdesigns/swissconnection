"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, User, LogOut, MessageSquare, Search } from "lucide-react";

export function Navbar() {
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
              className="h-[25px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isProvider && (
              <Link
                href="/provider/setup"
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Search size={18} />
                <span>Provide your Services</span>
              </Link>
            )}

            {status === "authenticated" && session?.user ? (
              <>
                <Link
                  href="/messages"
                  className="relative flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
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
                        Profile
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-secondary"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <MessageSquare size={16} />
                        Messages
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
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-text text-sm">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
                Provide your Services
              </Link>
            )}
            {status === "authenticated" ? (
              <>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 py-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
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
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="block w-full text-left py-2.5 text-text-secondary hover:text-text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block py-2.5 text-brand-500 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
