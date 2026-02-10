"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  providerId: string;
  onReviewSubmitted?: () => void;
}

export function WriteReview({ providerId, onReviewSubmitted }: Props) {
  const { status } = useSession();
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/reviews/can-review?providerId=${providerId}`)
      .then((r) => r.json())
      .then((d) => setCanReview(d.canReview))
      .catch(() => {});
  }, [status, providerId]);

  if (status !== "authenticated" || !canReview || submitted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, rating, text: text.trim() }),
      });
      if (res.ok) {
        toast.success("Review submitted!");
        setSubmitted(true);
        onReviewSubmitted?.();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">Write a review</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              size={24}
              className={
                star <= (hoverRating || rating)
                  ? "fill-current text-yellow-500"
                  : "text-surface-border"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        className="input-field text-sm"
        rows={3}
        placeholder="Share your experience..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={submitting || rating === 0 || !text.trim()}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
