import { db } from "@/db";
import { reviews, clinics, patients } from "@/db/schema";
import { desc, eq, count, avg, sql } from "drizzle-orm";
import { format } from "date-fns";
import { Star, ShieldCheck, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleVerifiedButton } from "../_components/review-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews | Doctor Diary Admin" };

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  // Aggregated stats
  const [totalResult, verifiedResult, avgRatingResult] = await Promise.all([
    db.select({ value: count() }).from(reviews),
    db.select({ value: count() }).from(reviews).where(eq(reviews.isVerified, true)),
    db.select({ value: avg(reviews.rating) }).from(reviews),
  ]);

  // Rating distribution
  const ratingDistResult = await db.execute(sql`
    SELECT rating, COUNT(*)::int AS cnt
    FROM reviews
    GROUP BY rating
    ORDER BY rating DESC
  `);
  const ratingDist = ratingDistResult.rows as Array<{ rating: number; cnt: number }>;

  // All reviews
  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      clinicName: clinics.name,
      clinicId: reviews.clinicId,
      patientName: patients.name,
    })
    .from(reviews)
    .leftJoin(clinics, eq(reviews.clinicId, clinics.id))
    .leftJoin(patients, eq(reviews.patientId, patients.id))
    .orderBy(desc(reviews.createdAt));

  const total = totalResult[0]?.value ?? 0;
  const verified = verifiedResult[0]?.value ?? 0;
  const unverified = total - verified;
  const avgRating = Number(avgRatingResult[0]?.value ?? 0).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reviews</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Moderate patient reviews across all clinics.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reviews", value: total, color: "text-slate-900" },
          {
            label: "Verified",
            value: verified,
            color: "text-emerald-700",
          },
          {
            label: "Unverified",
            value: unverified,
            color: "text-slate-500",
          },
          {
            label: "Avg Rating",
            value: `${avgRating} ★`,
            color: "text-amber-600",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className={`text-2xl font-bold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Distribution */}
      {ratingDist.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const row = ratingDist.find((r) => Number(r.rating) === star);
                const cnt = row?.cnt ?? 0;
                const pct = total > 0 ? (cnt / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-600">{star}</span>
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{cnt}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            All Reviews ({total})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto min-w-full">
          <div className="min-w-[700px]">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="whitespace-nowrap">Clinic</TableHead>
                <TableHead className="hidden sm:table-cell whitespace-nowrap">Patient</TableHead>
                <TableHead className="whitespace-nowrap">Rating</TableHead>
                <TableHead className="whitespace-nowrap">Comment</TableHead>
                <TableHead className="hidden md:table-cell whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allReviews.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-400 text-sm"
                  >
                    No reviews yet.
                  </TableCell>
                </TableRow>
              ) : (
                allReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm font-medium text-slate-900 min-w-[150px] truncate">
                      {review.clinicName ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-600 truncate">
                      {review.patientName ?? "Anonymous"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {review.comment ?? (
                          <span className="italic text-slate-400">No comment</span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <ToggleVerifiedButton
                        reviewId={review.id}
                        isVerified={review.isVerified}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
