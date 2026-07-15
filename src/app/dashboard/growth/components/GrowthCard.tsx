import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export interface GrowthCardProps {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  logoUrl?: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "premium" | "success";
  };
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
  logoUrl,
  badge,
  ctaText = "Explore Solution",
  isIntegrated = false,
  price,
  pricingPeriod,
  onAction,
}: GrowthCardProps) {
  return (
    <div className="group relative flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1">
      
      {/* Header: Icon/Logo and Badge */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-colors">
          {logoUrl ? (
            <Image src={logoUrl} alt={title} width={28} height={28} className="object-contain" unoptimized />
          ) : icon ? (
            <div className="text-slate-600 group-hover:text-blue-600 transition-colors [&>svg]:w-7 [&>svg]:h-7">
              {icon}
            </div>
          ) : (
            <div className="w-7 h-7 bg-slate-200 rounded-full" />
          )}
        </div>
        
        {badge && (
          <Badge 
            variant={badge.variant as any} 
            className={`
              rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm
              ${badge.variant === 'premium' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0' : ''}
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
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* Footer / CTA */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        {isIntegrated ? (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 py-2 w-full justify-center bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
            Integration Active
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {price !== undefined ? (
                <>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starts at</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                    {pricingPeriod && <span className="text-sm font-medium text-slate-500">/{pricingPeriod}</span>}
                  </div>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-500">Custom Pricing</span>
              )}
            </div>
            
            <Button 
              className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl transition-all shadow-md hover:shadow-blue-600/20 px-5"
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
