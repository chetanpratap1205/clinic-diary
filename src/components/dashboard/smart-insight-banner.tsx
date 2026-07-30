"use client";

import { InsightBanner } from "@/lib/dashboard-engine";
import { CopyLinkButton } from "./copy-link-button";
import { AlertCircle, CheckCircle2, Info, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SmartInsightBannerProps {
  insight: InsightBanner;
}

export function SmartInsightBanner({ insight }: SmartInsightBannerProps) {
  const getStyles = () => {
    switch (insight.variant) {
      case "success":
        return {
          wrapper: "bg-emerald-950 border-emerald-900",
          glow: "bg-emerald-500/20 group-hover:bg-emerald-500/30",
          iconBg: "bg-emerald-500/20 border-emerald-500/30",
          iconColor: "text-emerald-400",
          titleColor: "text-emerald-400",
          textColor: "text-emerald-100",
          icon: CheckCircle2,
        };
      case "warning":
        return {
          wrapper: "bg-amber-950 border-amber-900",
          glow: "bg-amber-500/20 group-hover:bg-amber-500/30",
          iconBg: "bg-amber-500/20 border-amber-500/30",
          iconColor: "text-amber-400",
          titleColor: "text-amber-400",
          textColor: "text-amber-100",
          icon: AlertCircle,
        };
      case "purple":
        return {
          wrapper: "bg-purple-950 border-purple-900",
          glow: "bg-purple-500/20 group-hover:bg-purple-500/30",
          iconBg: "bg-purple-500/20 border-purple-500/30",
          iconColor: "text-purple-400",
          titleColor: "text-purple-400",
          textColor: "text-purple-100",
          icon: TrendingUp,
        };
      case "default":
        return {
          wrapper: "bg-slate-900 border-slate-800",
          glow: "bg-slate-500/20 group-hover:bg-slate-500/30",
          iconBg: "bg-slate-500/20 border-slate-500/30",
          iconColor: "text-slate-400",
          titleColor: "text-slate-400",
          textColor: "text-slate-300",
          icon: Info,
        };
      case "info":
      default:
        return {
          wrapper: "bg-blue-950 border-blue-900",
          glow: "bg-blue-500/20 group-hover:bg-blue-500/30",
          iconBg: "bg-blue-500/20 border-blue-500/30",
          iconColor: "text-blue-400",
          titleColor: "text-blue-400",
          textColor: "text-blue-100",
          icon: Info,
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden group border",
        styles.wrapper
      )}
    >
      {/* Ambient Glow */}
      <div
        className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-[60px] transition-colors duration-700 pointer-events-none",
          styles.glow
        )}
      />

      <div className="flex items-start sm:items-center gap-4 relative z-10">
        <div
          className={cn(
            "p-3 rounded-2xl border shrink-0",
            styles.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
        <div>
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest mb-1",
              styles.titleColor
            )}
          >
            {insight.title}
          </p>
          <p
            className={cn(
              "text-sm sm:text-base leading-relaxed font-medium",
              styles.textColor
            )}
          >
            {insight.message}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {insight.actionType !== "none" && insight.actionText && (
        <div className="relative z-10 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
          {insight.actionType === "copy_link" && insight.actionUrl && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <CopyLinkButton url={insight.actionUrl} className="w-full sm:w-auto min-w-[160px] bg-white text-slate-900 hover:bg-slate-100 border-none shadow-md" />
            </div>
          )}
          {insight.actionType === "link" && insight.actionUrl && (
            <Link
              href={insight.actionUrl}
              className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px] bg-white text-slate-900 font-semibold px-4 py-2 rounded-xl hover:bg-slate-100 transition-all shadow-md active:scale-95 text-sm"
            >
              {insight.actionText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {insight.actionType === "whatsapp" && insight.actionUrl && (
            <a
              href={insight.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px] bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 text-sm"
            >
              {insight.actionText}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
