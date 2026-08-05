import { db } from "@/db";
import { reviews, clinics, patients } from "@/db/schema";
import { desc, eq, count, avg, and, or, ilike, lte, sql } from "drizzle-orm";
import { Star, ShieldCheck, MessageSquare, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReviewsTable, type ReviewRow } from "../_components/reviews-table";
import { ExportReviewsButton } from "../_components/export-reviews-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient Reviews & Trust Moderation | Admin Console" };

export default async function ReviewsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const tab = typeof searchParams?.tab === "string" ? searchParams.tab : "all";
  const ratingFilter = typeof searchParams?.rating === "string" ? searchParams.rating : "all";

  const PAGE_SIZE = 25;
  const offset = (page - 1) * PAGE_SIZE;

  // Build dynamic condition
  let condition = undefined;

  if (search) {
    condition = or(
      ilike(clinics.name, `%${search}%`),
      ilike(patients.name, `%${search}%`),
      ilike(reviews.comment, `%${search}%`)
    );
  }

  if (ratingFilter && ratingFilter !== "all") {
    const starNum = Number(ratingFilter);
    condition = condition
      ? and(condition, eq(reviews.rating, starNum))
      : eq(reviews.rating, starNum);
  }

  if (tab === "verified") {
    condition = condition ? and(condition, eq(reviews.isVerified, true)) : eq(reviews.isVerified, true);
  } else if (tab === "pending") {
    condition = condition ? and(condition, eq(reviews.isVerified, false)) : eq(reviews.isVerified, false);
  } else if (tab === "critical") {
    condition = condition ? and(condition, lte(reviews.rating, 2)) : lte(reviews.rating, 2);
  }

  // 1. Aggregated stats & Tab counts
  const [totalResult, verifiedResult, avgRatingResult, countsResult] = await Promise.all([
    db.select({ value: count() }).from(reviews),
    db.select({ value: count() }).from(reviews).where(eq(reviews.isVerified, true)),
    db.select({ value: avg(reviews.rating) }).from(reviews),
    db.execute(sql`
      SELECT 
        COUNT(*)::int as all,
        SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END)::int as verified,
        SUM(CASE WHEN is_verified = false THEN 1 ELSE 0 END)::int as pending,
        SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END)::int as critical
      FROM reviews
    `),
  ]);

  const total = totalResult[0]?.value ?? 0;
  const verified = verifiedResult[0]?.value ?? 0;
  const avgRating = Number(avgRatingResult[0]?.value ?? 0).toFixed(1);
  const counts = countsResult.rows[0] as { all: number; verified: number; pending: number; critical: number };

  // 2. Rating distribution
  const ratingDistResult = await db.execute(sql`
    SELECT rating, COUNT(*)::int AS cnt
    FROM reviews
    GROUP BY rating
    ORDER BY rating DESC
  `);
  const ratingDist = ratingDistResult.rows as Array<{ rating: number; cnt: number }>;

  // 3. Paginated Reviews query
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
    .where(condition)
    .orderBy(desc(reviews.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // 4. Total count for current filter
  const totalCountResult = await db
    .select({ count: count() })
    .from(reviews)
    .leftJoin(clinics, eq(reviews.clinicId, clinics.id))
    .leftJoin(patients, eq(reviews.patientId, patients.id))
    .where(condition);
  const filteredTotalCount = totalCountResult[0]?.count || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Reviews & Moderation</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Trust Console
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Moderate public patient feedback, verify legitimate clinic reviews, and respond to critical ratings.
          </p>
        </div>

        <div>
          <ExportReviewsButton reviews={allReviews as ReviewRow[]} />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Reviews", value: total, color: "text-slate-900", bg: "border-slate-200" },
          { label: "Verified Reviews", value: verified, color: "text-emerald-700", bg: "border-emerald-200 bg-emerald-50/20" },
          { label: "Pending Moderation", value: counts.pending || 0, color: "text-amber-700", bg: "border-amber-200 bg-amber-50/20" },
          { label: "Average Rating", value: `${avgRating} ★`, color: "text-amber-600", bg: "border-amber-200 bg-amber-50/10" },
        ].map((s) => (
          <div
            key={s.label}
            className={`border rounded-xl px-4 py-3 shadow-xs bg-white ${s.bg}`}
          >
            <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Rating Distribution Breakdown */}
      {ratingDist.length > 0 && (
        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">
              Platform Rating Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Distribution of patient star ratings across all verified clinics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const row = ratingDist.find((r) => Number(r.rating) === star);
                const cnt = row?.cnt ?? 0;
                const pct = total > 0 ? (cnt / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{star} Star</span>
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-12 text-right shrink-0">
                      {cnt} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Searchable, Moderatable Reviews Table */}
      <ReviewsTable
        reviews={allReviews as ReviewRow[]}
        totalCount={filteredTotalCount}
        currentPage={page}
        currentSearch={search}
        currentTab={tab}
        currentRating={ratingFilter}
        counts={{
          all: counts.all || 0,
          verified: counts.verified || 0,
          pending: counts.pending || 0,
          critical: counts.critical || 0,
        }}
      />
    </div>
  );
}
