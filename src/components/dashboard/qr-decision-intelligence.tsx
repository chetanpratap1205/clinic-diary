"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Lightbulb, QrCode, ArrowRight, ShieldCheck, MapPin, Eye } from "lucide-react";

interface PlacementStat {
  placement: "reception" | "window" | "stand" | "sticker" | "general" | string;
  name: string;
  icon: string;
  scans: number;
  appointments: number;
  revenue: number;
}

interface QRDecisionIntelligenceProps {
  doctorName?: string | null;
  clinicName?: string | null;
  placementStats: PlacementStat[];
}

export function QRDecisionIntelligence({
  doctorName,
  clinicName,
  placementStats,
}: QRDecisionIntelligenceProps) {
  const totalScans = useMemo(
    () => placementStats.reduce((acc, curr) => acc + curr.scans, 0),
    [placementStats]
  );

  const totalAppts = useMemo(
    () => placementStats.reduce((acc, curr) => acc + curr.appointments, 0),
    [placementStats]
  );

  const overallConversion = totalScans > 0 ? Math.round((totalAppts / totalScans) * 100) : 0;

  // Identify top performing physical placement
  const topPlacement = useMemo(() => {
    if (placementStats.length === 0) return null;
    return [...placementStats].sort((a, b) => b.appointments - a.appointments)[0];
  }, [placementStats]);

  // Generate automated decision insights
  const insights = useMemo(() => {
    const tips: { title: string; desc: string; type: "success" | "warning" | "info" }[] = [];

    if (!topPlacement || totalScans === 0) {
      tips.push({
        title: "Setup & Placement Tip",
        desc: "Deploy all 4 physical QR formats (Reception Poster, Outside Window, Acrylic Desk Stand, and Prescription Stickers) to begin tracking placement analytics.",
        type: "info",
      });
      return tips;
    }

    if (topPlacement.placement === "reception" || topPlacement.placement === "stand") {
      tips.push({
        title: "In-Clinic Waiting Room Hero",
        desc: `${topPlacement.name} is driving ${Math.round((topPlacement.appointments / (totalAppts || 1)) * 100)}% of your QR bookings. Recommendation: Keep an extra Acrylic Standee on the billing counter.`,
        type: "success",
      });
    }

    const windowStat = placementStats.find((s) => s.placement === "window");
    if (windowStat && windowStat.scans > 10 && windowStat.appointments === 0) {
      tips.push({
        title: "Outside Window Opportunity",
        desc: `Your Outside Window Poster got ${windowStat.scans} scans but low booking conversions. Recommendation: Ensure your slot timings for tomorrow and lunch breaks are active in settings.`,
        type: "warning",
      });
    }

    const stickerStat = placementStats.find((s) => s.placement === "sticker");
    if (stickerStat && stickerStat.appointments > 0) {
      tips.push({
        title: "Patient File Retention Booster",
        desc: `Prescription stickers have generated ${stickerStat.appointments} return visits! Recommendation: Ask staff to stick a QR sticker on every patient prescription sheet.`,
        type: "info",
      });
    }

    return tips;
  }, [topPlacement, totalScans, totalAppts, placementStats]);

  return (
    <Card className="border-teal-100 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-teal-100/60 pb-4 bg-white/70 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5">
                AI Decision Engine
              </Badge>
              <span className="text-xs font-mono text-slate-400">#QR-INTELLIGENCE</span>
            </div>
            <CardTitle className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              Physical QR Performance & Decision Intelligence
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Real-time analytics for {doctorName || clinicName || "Doctor Clinic"} across all physical QR placements.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-teal-100 shadow-2xs">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion</p>
              <p className="text-lg font-black text-teal-700">{overallConversion}%</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Placement Metrics Table Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {placementStats.map((stat) => {
            const conversion = stat.scans > 0 ? Math.round((stat.appointments / stat.scans) * 100) : 0;
            return (
              <div
                key={stat.placement}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{stat.icon}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {conversion}% Conv.
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{stat.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">#{stat.placement}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Scans</span>
                    <span className="font-extrabold text-slate-800 text-sm">{stat.scans}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Bookings</span>
                    <span className="font-black text-teal-700 text-sm">{stat.appointments}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable Decision Insights Banner */}
        <div className="bg-white p-4 rounded-xl border border-teal-200/70 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Strategic Recommendations for Doctor:</span>
          </div>

          <div className="space-y-2">
            {insights.map((tip, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs flex items-start gap-3 border ${
                  tip.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : tip.type === "warning"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-sky-50 text-sky-900 border-sky-200"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {tip.type === "success" ? (
                    <Award className="w-4 h-4 text-emerald-600" />
                  ) : tip.type === "warning" ? (
                    <Eye className="w-4 h-4 text-amber-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">{tip.title}</p>
                  <p className="mt-0.5 leading-relaxed opacity-90">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
