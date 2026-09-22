import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Zap, Stethoscope, ClipboardList, Sparkles, ArrowUpRight } from "lucide-react";

export interface GrowthCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  targetRole?: "doctor" | "receptionist" | "both";
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "premium" | "success" | "warning";
  };
  stats?: { label: string; value: string }[];
  features?: string[];
  ctaText?: string;
  isIntegrated?: boolean;
  isCustomOnDemand?: boolean;
  price?: number;
  pricingPeriod?: string;
  onAction?: () => void;
  requestStatus?: string;
}

export function GrowthCard({
  title,
  description,
  icon,
  targetRole = "both",
  badge,
  stats,
  features,
  ctaText = "Request Setup",
  isIntegrated = false,
  isCustomOnDemand = false,
  price,
  pricingPeriod,
  onAction,
  requestStatus,
}: GrowthCardProps) {
  const isPending = requestStatus === "pending";
  const isActive = isIntegrated || requestStatus === "active" || requestStatus === "paid";

  return (
    <div
      className={`group relative flex flex-col h-full bg-white border ${
        isActive
          ? "border-emerald-300 ring-1 ring-emerald-500/20 shadow-sm"
          : isPending
          ? "border-amber-300 bg-amber-50/10"
          : "border-slate-200/80 hover:border-blue-400/80 hover:shadow-xl hover:shadow-blue-500/5"
      } rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Top Banner / Role & Badge */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2 border-b border-slate-100/80 bg-slate-50/40">
        <div className="flex items-center gap-1.5">
          {targetRole === "doctor" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
              <Stethoscope className="w-3 h-3 text-blue-600" /> Doctor Value
            </span>
          )}
          {targetRole === "receptionist" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full">
              <ClipboardList className="w-3 h-3 text-purple-600" /> Receptionist Ease
            </span>
          )}
          {targetRole === "both" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Enterprise Wide
            </span>
          )}
        </div>

        {badge && (
          <Badge
            className={`
              rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-0 shadow-none
              ${
                badge.variant === "premium"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : ""
              }
              ${badge.variant === "success" ? "bg-emerald-100 text-emerald-800" : ""}
              ${badge.variant === "default" ? "bg-blue-100 text-blue-800" : ""}
              ${badge.variant === "warning" ? "bg-amber-100 text-amber-800" : ""}
              ${badge.variant === "outline" ? "bg-slate-100 text-slate-700" : ""}
            `}
          >
            {badge.text}
          </Badge>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900/5 group-hover:bg-blue-600/10 border border-slate-200/60 group-hover:border-blue-300/60 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105">
            <div className="[&>svg]:w-6 [&>svg]:h-6 transition-colors group-hover:text-blue-600">{icon}</div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* On-Demand Tag if applicable */}
        {isCustomOnDemand && (
          <div className="my-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-center gap-2 text-[11px] font-semibold text-amber-800">
            <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Available on Request • Custom built for your clinic in 48h</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 my-3">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-slate-50/80 border border-slate-150 p-2 rounded-xl text-center group-hover:bg-blue-50/40 group-hover:border-blue-100 transition-colors"
              >
                <div className="text-sm font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features List */}
        {features && features.length > 0 && (
          <div className="mt-auto pt-3 space-y-1.5">
            {features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div className="flex flex-col">
          {isActive ? (
            <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">Active & Ready</span>
          ) : price !== undefined ? (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block -mb-0.5">Investment</span>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-slate-900">₹{price.toLocaleString("en-IN")}</span>
                {pricingPeriod && <span className="text-[10px] font-bold text-slate-500">/{pricingPeriod}</span>}
              </div>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-600">On-Demand Setup</span>
          )}
        </div>

        {isActive ? (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </div>
        ) : isPending ? (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Requested
          </div>
        ) : (
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold px-4 h-9 shadow-sm transition-all flex items-center gap-1"
            onClick={onAction}
          >
            {ctaText}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
