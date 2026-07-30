"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import Link from "next/link";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";

interface FollowUpsWidgetProps {
  dueTodayFollowUps: any[];
  dueTodayCount: number;
  clinicData: {
    name: string;
    slug: string;
  };
}

export function FollowUpsWidget({ dueTodayFollowUps, dueTodayCount, clinicData }: FollowUpsWidgetProps) {
  return (
    <FadeInUp>
      <Card className="border-surface-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full overflow-hidden bg-gradient-to-br from-slate-50/50 to-white">
        <CardHeader className="bg-transparent border-b border-surface-100/50 py-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-surface-950 flex items-center gap-2 sm:gap-3">
              <PremiumIcon Icon={Calendar} variant={dueTodayCount > 0 ? "warning" : "glass"} size="sm" />
              <span className="truncate">Follow-ups Due Today</span>
            </CardTitle>
            <Link href="/dashboard/follow-ups" className="text-[11px] sm:text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {dueTodayFollowUps.length === 0 ? (
            <div className="text-center py-10 sm:py-12">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-50 mb-4 border border-emerald-100/50 shadow-sm">
                 <CheckCircle2 strokeWidth={2} className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
              </div>
              <p className="text-emerald-800 font-bold text-base sm:text-lg mb-1">Inbox Zero!</p>
              <p className="text-emerald-600/80 text-xs sm:text-sm max-w-[200px] mx-auto">All your follow-ups are cleared for today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {dueTodayFollowUps.map((fu) => (
                <FollowUpCard 
                  key={fu.id} 
                  followUp={fu} 
                  variant="today" 
                  clinic={{ name: clinicData?.name || "", slug: clinicData?.slug || "" }} 
                />
              ))}
              {dueTodayCount > 3 && (
                <Link href="/dashboard/follow-ups" className="w-full text-center py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  + {dueTodayCount - 3} more
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeInUp>
  );
}
