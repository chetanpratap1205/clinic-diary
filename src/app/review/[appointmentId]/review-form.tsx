"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, MessageSquareText } from "lucide-react";
import { submitReview } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ReviewForm({
  appointmentId,
  themeColor,
}: {
  appointmentId: string;
  themeColor: string;
}) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitReview(appointmentId, rating, comment);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted successfully!");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating Selection */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                    isFilled ? "fill-amber-400 text-amber-400" : "text-slate-200"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <div className="h-6">
          {rating > 0 && (
            <span className="text-sm font-bold text-slate-700 animate-in fade-in slide-in-from-bottom-1">
              {rating === 5 && "Excellent!"}
              {rating === 4 && "Very Good!"}
              {rating === 3 && "Average."}
              {rating === 2 && "Poor."}
              {rating === 1 && "Terrible."}
            </span>
          )}
        </div>
      </div>

      {/* Optional Comment */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquareText className="w-4 h-4 text-slate-400" />
          Share your experience <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like? What could be improved?"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:bg-white transition-colors resize-none h-32 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
          maxLength={500}
        />
        <div className="flex justify-end">
          <span className="text-[11px] font-medium text-slate-400">
            {comment.length} / 500
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="w-full h-12 rounded-xl text-white font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        style={{ backgroundColor: themeColor }}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
