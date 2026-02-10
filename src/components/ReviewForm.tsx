"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Send } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface ReviewFormProps {
  providerId: string;
  onReviewAdded?: () => void;
}

export function ReviewForm({ providerId, onReviewAdded }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!session?.user) {
    return (
      <div className="p-4 bg-surface-secondary rounded-card text-center">
        <p className="text-sm text-text-secondary mb-2">
          Sign in to leave a review
        </p>
        <Link href="/login" className="btn-primary text-sm inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 rounded-card text-center border border-green-100">
        <p className="text-sm text-green-700 font-medium">
          Thank you for your review!
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (text.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          rating,
          text,
        }),
      });

      if (res.ok) {
        toast.success("Review submitted!");
        setSubmitted(true);
        onReviewAdded?.();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoveredRating || rating)
                    ? "fill-current text-yellow-500"
                    : "text-surface-border"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Your Review
        </label>
        <textarea
          className="input-field min-h-[100px]"
          placeholder="Tell others about your experience..."
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {text.length}/1000 characters (min 10)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0 || text.length < 10}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Send size={16} />
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
