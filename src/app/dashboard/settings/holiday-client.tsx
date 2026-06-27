"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { addHoliday, removeHoliday } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { Loader2, CalendarX2, Trash2 } from "lucide-react";

export function HolidayClient({
  initialHolidays,
}: {
  initialHolidays: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    startTransition(async () => {
      const res = await addHoliday(date);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Holiday added!");
        setDate("");
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const res = await removeHoliday(id);
      if (res.error) toast.error(res.error);
      else toast.success("Holiday removed!");
    });
  };

  // Sort dates properly
  const sortedHolidays = [...initialHolidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden mt-6">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-3">
          <PremiumIcon Icon={CalendarX2} variant="default" size="sm" /> Holidays & Blocked Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-5">
        <form onSubmit={handleAdd} className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Add a Holiday (Clinic Closed)</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="h-11 rounded-xl"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!date || isPending}
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </Button>
        </form>

        <div className="space-y-2 pt-2">
          {sortedHolidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <PremiumIcon Icon={CalendarX2} variant="glass" size="lg" className="mb-3" />
              <p className="text-sm text-slate-500 text-center">
                No holidays added. You are available on all configured working hours.
              </p>
            </div>
          ) : (
            sortedHolidays.map((holiday) => (
              <div 
                key={holiday.id} 
                className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors"
              >
                <div className="font-medium text-slate-700 text-sm">
                  {format(parseISO(holiday.date), "EEEE, MMMM d, yyyy")}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(holiday.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove holiday"
                >
                  <Trash2 strokeWidth={1.5} className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
