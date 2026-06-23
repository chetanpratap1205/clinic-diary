"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateClinicAvailability } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Clock } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AvailabilityClient({
  initialAvailability,
}: {
  initialAvailability: any[];
}) {
  const [isPending, startTransition] = useTransition();

  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((name, i) => {
      const existing = initialAvailability.find((a) => a.dayOfWeek === i);
      return {
        dayOfWeek: i,
        name,
        enabled: !!existing,
        startTime: existing?.startTime?.slice(0, 5) || "09:00",
        endTime: existing?.endTime?.slice(0, 5) || "17:00",
        slotDurationMinutes: existing?.slotDurationMinutes || 30,
      };
    });
  });

  const handleToggle = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      enabled: !newSchedule[index].enabled,
    };
    setSchedule(newSchedule);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const onSave = () => {
    const dataToSave = schedule
      .filter((s) => s.enabled)
      .map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDurationMinutes: s.slotDurationMinutes,
      }));

    startTransition(async () => {
      const res = await updateClinicAvailability(dataToSave);
      if (res.error) toast.error(res.error);
      else toast.success("Availability updated!");
    });
  };

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">
          Working Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="space-y-1">
          {schedule.map((day, idx) => (
            <div
              key={day.name}
              className={`rounded-xl border transition-all duration-200 ${
                day.enabled
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-50/50 border-transparent"
              }`}
            >
              {/* Day Toggle Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={day.enabled}
                  onClick={() => handleToggle(idx)}
                  className={`w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative ${
                    day.enabled ? "bg-teal-600" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-200 ${
                      day.enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-semibold flex-1 ${
                    day.enabled ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {day.name}
                </span>
                {day.enabled && (
                  <span className="text-xs text-slate-400 font-medium">
                    {day.startTime} – {day.endTime}
                  </span>
                )}
              </div>

              {/* Time Config — only when enabled */}
              {day.enabled && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500 w-10 flex-shrink-0">From</span>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          handleChange(idx, "startTime", e.target.value)
                        }
                        className="flex-1 h-9 text-sm rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500 w-10 flex-shrink-0">To</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          handleChange(idx, "endTime", e.target.value)
                        }
                        className="flex-1 h-9 text-sm rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 flex-shrink-0 w-10 sm:w-auto">Slot</span>
                      <select
                        className="h-9 rounded-lg border border-slate-200 text-sm px-2 bg-white text-slate-700 flex-1 sm:flex-none sm:w-28 cursor-pointer"
                        value={day.slotDurationMinutes}
                        onChange={(e) =>
                          handleChange(
                            idx,
                            "slotDurationMinutes",
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>1 hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button
            onClick={onSave}
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Working Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
