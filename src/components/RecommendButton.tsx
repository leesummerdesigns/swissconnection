"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Award, X } from "lucide-react";
import toast from "react-hot-toast";

interface RecommendButtonProps {
  userId: string;
  userName: string;
}

export function RecommendButton({ userId, userName }: RecommendButtonProps) {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;
  if ((session.user as any).id === userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendedId: userId, text }),
      });

      if (res.ok) {
        toast.success(`Recommendation for ${userName} sent!`);
        setShowForm(false);
        setText("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send recommendation");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="mt-4 p-4 bg-brand-50 rounded-card border border-brand-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Recommend {userName}</h4>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="input-field text-sm min-h-[80px] mb-3"
            placeholder={`Why do you recommend ${userName}?`}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary text-sm"
          >
            {loading ? "Sending..." : "Send Recommendation"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="btn-secondary w-full text-center flex items-center justify-center gap-2 mt-3"
    >
      <Award size={18} />
      Recommend
    </button>
  );
}
