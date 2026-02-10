import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: Date | string;
  reviewer: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-text-secondary text-sm">No reviews yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="pb-6 border-b border-surface-border last:border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium text-sm">
              {review.reviewer.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{review.reviewer.name}</p>
              <p className="text-xs text-text-tertiary">
                {new Date(review.createdAt).toLocaleDateString("de-CH", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= review.rating
                    ? "fill-current text-yellow-500"
                    : "text-surface-border"
                }
              />
            ))}
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  );
}
