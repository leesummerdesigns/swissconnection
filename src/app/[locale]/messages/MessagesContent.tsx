"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Thread {
  id: string;
  lastMessageAt: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  lastMessage?: {
    body: string;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  body: string;
  originalBody?: string;
  isTranslated?: boolean;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
  };
}

export default function MessagesContent() {
  const t = useTranslations("messages");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("to");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchThreads();
    }
  }, [status]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread);
      const interval = setInterval(() => fetchMessages(activeThread), 5000);
      return () => clearInterval(interval);
    }
  }, [activeThread]);

  async function fetchThreads() {
    try {
      const res = await fetch("/api/messages/threads", {
        headers: { "X-Locale": locale },
      });
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        if (data.length > 0 && !activeThread && !toUserId) {
          setActiveThread(data[0].id);
        }
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(threadId: string) {
    try {
      const res = await fetch(`/api/messages/threads/${threadId}`, {
        headers: { "X-Locale": locale },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // Handle error silently
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      const body: any = { body: newMessage };
      if (activeThread) {
        body.threadId = activeThread;
      } else if (toUserId) {
        body.recipientId = toUserId;
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Locale": locale },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setNewMessage("");
        if (!activeThread && data.threadId) {
          setActiveThread(data.threadId);
        }
        fetchMessages(data.threadId || activeThread!);
        fetchThreads();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedToSend"));
      }
    } catch {
      toast.error(t("failedToSend"));
    } finally {
      setSending(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container-page py-16 text-center text-text-secondary">
        {tc("loading")}
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">{t("title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Thread List */}
        <div className="md:col-span-1 border border-surface-border rounded-card overflow-hidden">
          <div className="p-4 border-b border-surface-border bg-surface-secondary">
            <h2 className="font-medium text-sm">{t("conversations")}</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-53px)]">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-secondary">
                {t("noConversations")}
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThread(thread.id)}
                  className={`w-full text-left p-4 border-b border-surface-border hover:bg-surface-hover transition-colors ${
                    activeThread === thread.id ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium text-sm flex-shrink-0">
                      {thread.otherUser.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {thread.otherUser.name}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className="text-xs text-text-tertiary truncate mt-0.5">
                          {thread.lastMessage.body}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 border border-surface-border rounded-card overflow-hidden flex flex-col">
          {activeThread || toUserId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && toUserId && (
                  <div className="text-center text-sm text-text-secondary py-8">
                    {t("startConversation")}
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        msg.senderId === currentUserId
                          ? "bg-brand-500 text-white rounded-br-sm"
                          : "bg-surface-secondary text-text-primary rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      {msg.isTranslated && (
                        <p
                          className={`text-[10px] italic mt-0.5 ${
                            msg.senderId === currentUserId
                              ? "text-white/50"
                              : "text-text-tertiary"
                          }`}
                        >
                          {t("autoTranslated")}
                        </p>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === currentUserId
                            ? "text-white/70"
                            : "text-text-tertiary"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString(locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-surface-border flex gap-2"
              >
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder={t("writePlaceholder")}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary px-4"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-secondary">
              <div className="text-center">
                <MessageSquare
                  size={48}
                  className="mx-auto mb-4 text-text-tertiary"
                />
                <p>{t("selectConversation")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
