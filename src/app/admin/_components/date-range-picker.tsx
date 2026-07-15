"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: fromParam ? new Date(fromParam) : startOfMonth(new Date()),
    to: toParam ? new Date(toParam) : new Date(),
  });

  const handleSelect = (newDate: { from?: Date; to?: Date } | undefined) => {
    if (!newDate) return;
    setDate({ from: newDate.from, to: newDate.to });
    
    if (newDate.from && newDate.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", format(newDate.from, "yyyy-MM-dd"));
      params.set("to", format(newDate.to, "yyyy-MM-dd"));
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const setPreset = (preset: "today" | "last7" | "last30" | "thisMonth" | "lastMonth") => {
    const today = new Date();
    let from: Date;
    let to: Date = today;

    switch (preset) {
      case "today":
        from = today;
        break;
      case "last7":
        from = subDays(today, 7);
        break;
      case "last30":
        from = subDays(today, 30);
        break;
      case "thisMonth":
        from = startOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
    }

    handleSelect({ from, to });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant={"outline"}
          className={`justify-start text-left font-normal h-9 text-xs shadow-sm bg-white border-slate-200 ${
            !date.from && "text-slate-500"
          }`}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
          {date.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
              </>
            ) : (
              format(date.from, "MMM d, yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex items-start" align="end">
        <div className="flex flex-col gap-1 p-3 border-r border-slate-100 bg-slate-50">
          <Button variant="ghost" className="justify-start h-8 text-xs font-normal" onClick={() => setPreset("today")}>Today</Button>
          <Button variant="ghost" className="justify-start h-8 text-xs font-normal" onClick={() => setPreset("last7")}>Last 7 days</Button>
          <Button variant="ghost" className="justify-start h-8 text-xs font-normal" onClick={() => setPreset("last30")}>Last 30 days</Button>
          <Button variant="ghost" className="justify-start h-8 text-xs font-normal" onClick={() => setPreset("thisMonth")}>This month</Button>
          <Button variant="ghost" className="justify-start h-8 text-xs font-normal" onClick={() => setPreset("lastMonth")}>Last month</Button>
        </div>
        <div className="p-3">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={{ from: date.from, to: date.to }}
            onSelect={handleSelect as any}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
