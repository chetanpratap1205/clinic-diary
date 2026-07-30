import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { QueueCard } from "./queue-card";
import type { Appointment, Clinic } from "@/db/schema";

interface QueueColumnProps {
  title: string;
  count: number;
  items: Appointment[];
  icon: any;
  colorClass: string;
  clinic: Clinic;
  isPending: boolean;
  handleStatusChange: (id: string, status: string, fee?: number) => Promise<boolean>;
  router: any;
  now: Date;
  delayMinutes: number;
  followUpMap?: Record<string, { isFree: boolean; feeOverride: number | null }>;
  emptyStateMessage?: string;
}

export const QueueColumn = ({
  title,
  count,
  items,
  icon: Icon,
  colorClass,
  clinic,
  isPending,
  handleStatusChange,
  router,
  now,
  delayMinutes,
  followUpMap,
  emptyStateMessage,
}: QueueColumnProps) => {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 h-full max-h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <Icon className={cn("w-4 h-4", colorClass)} /> {title}
        </h2>
        <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto hide-scrollbar pb-4">
        <AnimatePresence mode="popLayout">
          {items.map((appt: Appointment) => (
            <QueueCard
              key={appt.id}
              appt={appt}
              clinic={clinic}
              isPending={isPending}
              handleStatusChange={handleStatusChange}
              router={router}
              now={now}
              delayMinutes={delayMinutes}
              followUpInfo={followUpMap?.[appt.id]}
            />
          ))}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-12 px-4 text-center border-2 border-dashed border-slate-200/60 rounded-2xl bg-white/50 min-h-[200px]"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                <Icon className={cn("w-5 h-5", colorClass)} />
              </div>
              <p className="font-semibold text-slate-600 mb-1">Queue is empty</p>
              <p className="font-medium text-slate-500 text-xs">
                {emptyStateMessage || "No patients here."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
