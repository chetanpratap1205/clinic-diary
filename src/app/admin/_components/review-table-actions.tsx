"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2, Loader2 } from "lucide-react";
import { updateReviewStatusAction, deleteReviewAction } from "@/app/actions/reviews";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ReviewTableActionsProps {
  reviewId: string;
  isVerified: boolean;
}

export function ReviewTableActions({ reviewId, isVerified }: ReviewTableActionsProps) {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleToggleVerify = async () => {
    setLoading(true);
    try {
      const res = await updateReviewStatusAction(reviewId, !isVerified);
      if (res.success) {
        toast.success(isVerified ? "Review marked as unverified" : "Review verified ✓");
      } else {
        toast.error(res.error || "Failed to update review status");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        toast.success("Review deleted successfully");
        setDeleteOpen(false);
      } else {
        toast.error(res.error || "Failed to delete review");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* Verify / Unverify Button */}
      <button
        onClick={handleToggleVerify}
        disabled={loading}
        title={isVerified ? "Click to unverify" : "Click to verify"}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all disabled:opacity-50 ${
          isVerified
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
        }`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isVerified ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <ShieldOff className="w-3.5 h-3.5 text-slate-400" />
        )}
        {isVerified ? "Verified" : "Verify"}
      </button>

      {/* Delete Review Button */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
          title="Delete Review"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">Delete Patient Review?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm" disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
