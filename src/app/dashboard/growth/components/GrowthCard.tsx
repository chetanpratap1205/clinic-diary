import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

export interface GrowthCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "premium" | "success";
  };
  stats?: { label: string; value: string }[];
  features?: string[];
  ctaText?: string;
  isIntegrated?: boolean;
  price?: number;
  pricingPeriod?: string;
  onAction?: () => void;
}

export function GrowthCard({
  title,
  description,
  icon,
  badge,
  stats,
  features,
  ctaText = "Explore Solution",
  isIntegrated = false,
  price,
  pricingPeriod,
  onAction,
}: GrowthCardProps) {
  return (
    <div className="group relative flex flex-col h-full bg-white border border-slate-200 hover:border-blue-200 rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1">
      
      {/* Header Accent & Icon */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between relative overflow-hidden">
        {/* Subtle background glow based on hover */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:border-blue-100 transition-all duration-300">
          <div className="text-slate-600 group-hover:text-blue-600 transition-colors [&>svg]:w-7 [&>svg]:h-7">
            {icon}
          </div>
        </div>
        
        {badge && (
          <Badge 
            variant={badge.variant as any} 
            className={`
              relative z-10 rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm
              ${badge.variant === 'premium' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-indigo-500/20' : ''}
              ${badge.variant === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
              ${badge.variant === 'default' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
              ${badge.variant === 'outline' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
            `}
          >
            {badge.text}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="px-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
          {description}
        </p>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-2 sm:p-3 border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100/50 transition-colors">
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest mt-0.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Features List */}
        {features && features.length > 0 && (
          <div className="mb-6 space-y-2.5 mt-auto">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                <div className="mt-0.5 bg-blue-100 text-blue-600 rounded-full p-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="leading-tight">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="p-6 pt-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto group-hover:bg-blue-50/10 transition-colors">
        {isIntegrated ? (
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 py-2 w-full bg-emerald-100/50 border border-emerald-200 rounded-xl shadow-inner">
            <CheckCircle2 className="w-5 h-5" />
            Integration Active
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {price !== undefined ? (
                <>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Est. Investment</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 tracking-tight">₹{price.toLocaleString('en-IN')}</span>
                    {pricingPeriod && <span className="text-xs font-bold text-slate-500">/{pricingPeriod}</span>}
                  </div>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-500">Custom Quote</span>
              )}
            </div>
            
            <Button 
              className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all px-6 active:scale-95"
              onClick={onAction}
            >
              Request
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
