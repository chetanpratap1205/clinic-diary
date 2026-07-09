"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateClinicAvailability } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Clock,
  Zap,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  dayOfWeek: number;
  name: string;
  shortName: string;
  enabled: boolean;
  sessions: Session[];
  slotDurationMinutes: number;
  expanded: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  { name: "Sunday",    shortName: "Sun" },
  { name: "Monday",   shortName: "Mon" },
  { name: "Tuesday",  shortName: "Tue" },
  { name: "Wednesday",shortName: "Wed" },
  { name: "Thursday", shortName: "Thu" },
  { name: "Friday",   shortName: "Fri" },
  { name: "Saturday", shortName: "Sat" },
];

const SLOT_OPTIONS = [
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hr",   value: 60 },
];

// ─── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: "Morning OPD",
    emoji: "🌅",
    description: "Mon–Sat, 9am–1pm",
    apply: (): Partial<DaySchedule>[] =>
      DAYS.map((_, i) => ({
        enabled: i >= 1 && i <= 6, // Mon–Sat
        sessions: [{ startTime: "09:00", endTime: "13:00" }],
        slotDurationMinutes: 15,
      })),
  },
  {
    label: "Full Day",
    emoji: "☀️",
    description: "Mon–Sat, 9am–5pm",
    apply: (): Partial<DaySchedule>[] =>
      DAYS.map((_, i) => ({
        enabled: i >= 1 && i <= 6,
        sessions: [{ startTime: "09:00", endTime: "17:00" }],
        slotDurationMinutes: 30,
      })),
  },
  {
    label: "Split Session",
    emoji: "⚡",
    description: "Mon–Sat, 10–1pm & 4–8pm",
    apply: (): Partial<DaySchedule>[] =>
      DAYS.map((_, i) => ({
        enabled: i >= 1 && i <= 6,
        sessions: [
          { startTime: "10:00", endTime: "13:00" },
          { startTime: "16:00", endTime: "20:00" },
        ],
        slotDurationMinutes: 15,
      })),
  },
  {
    label: "Clear All",
    emoji: "🚫",
    description: "Disable all days",
    apply: (): Partial<DaySchedule>[] =>
      DAYS.map(() => ({
        enabled: false,
        sessions: [{ startTime: "09:00", endTime: "17:00" }],
        slotDurationMinutes: 30,
      })),
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""}${ampm}`;
}

function buildInitialSchedule(initialAvailability: any[]): DaySchedule[] {
  return DAYS.map((day, i) => {
    const rows = initialAvailability
      .filter((a) => a.dayOfWeek === i)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const enabled = rows.length > 0;
    const sessions: Session[] =
      rows.length > 0
        ? rows.map((r) => ({
            startTime: (r.startTime as string).slice(0, 5),
            endTime: (r.endTime as string).slice(0, 5),
          }))
        : [{ startTime: "09:00", endTime: "17:00" }];

    return {
      dayOfWeek: i,
      name: day.name,
      shortName: day.shortName,
      enabled,
      sessions,
      slotDurationMinutes: rows[0]?.slotDurationMinutes ?? 30,
      expanded: false,
    };
  });
}

// ─── TimeInput ─────────────────────────────────────────────────────────────────
function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all w-full"
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AvailabilityClient({
  initialAvailability,
}: {
  initialAvailability: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    buildInitialSchedule(initialAvailability)
  );

  // ── Mutators ──────────────────────────────────────────────────────────────────

  const applyPreset = (presetIndex: number) => {
    const patches = PRESETS[presetIndex].apply();
    setSchedule((prev) =>
      prev.map((day, i) => ({
        ...day,
        ...patches[i],
        expanded: false,
      }))
    );
    toast.info(`Preset applied — remember to save!`);
  };

  const toggleDay = (idx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === idx
          ? { ...d, enabled: !d.enabled, expanded: !d.enabled ? true : d.expanded }
          : d
      )
    );
  };

  const toggleExpand = (idx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, expanded: !d.expanded } : d))
    );
  };

  const updateSession = (
    dayIdx: number,
    sessionIdx: number,
    field: keyof Session,
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        const newSessions = d.sessions.map((s, si) =>
          si === sessionIdx ? { ...s, [field]: value } : s
        );
        return { ...d, sessions: newSessions };
      })
    );
  };

  const addSession = (dayIdx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx || d.sessions.length >= 2) return d;
        return {
          ...d,
          sessions: [...d.sessions, { startTime: "16:00", endTime: "20:00" }],
        };
      })
    );
  };

  const removeSession = (dayIdx: number, sessionIdx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          ...d,
          sessions: d.sessions.filter((_, si) => si !== sessionIdx),
        };
      })
    );
  };

  const setSlotDuration = (dayIdx: number, minutes: number) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, slotDurationMinutes: minutes } : d
      )
    );
  };

  const applyToAll = (sourceIdx: number) => {
    const source = schedule[sourceIdx];
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i === sourceIdx || !d.enabled) return d;
        return {
          ...d,
          sessions: source.sessions.map((s) => ({ ...s })),
          slotDurationMinutes: source.slotDurationMinutes,
        };
      })
    );
    toast.success(`Applied to all working days!`);
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const onSave = () => {
    const dataToSave: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
    }[] = [];

    for (const day of schedule) {
      if (!day.enabled) continue;
      for (const session of day.sessions) {
        if (session.startTime >= session.endTime) {
          toast.error(
            `${day.name}: Session end time must be after start time.`
          );
          return;
        }
        dataToSave.push({
          dayOfWeek: day.dayOfWeek,
          startTime: session.startTime,
          endTime: session.endTime,
          slotDurationMinutes: day.slotDurationMinutes,
        });
      }
    }

    startTransition(async () => {
      const res = await updateClinicAvailability(dataToSave);
      if (res.error) toast.error(res.error);
      else toast.success("Working hours saved successfully!");
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const enabledCount = schedule.filter((d) => d.enabled).length;

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" />
              Working Hours
            </CardTitle>
            <p className="text-sm text-slate-400 mt-0.5">
              {enabledCount === 0
                ? "All days off — set your schedule below"
                : `${enabledCount} day${enabledCount > 1 ? "s" : ""} active`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Presets ─────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/60 to-emerald-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Quick Presets
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(idx)}
                className="group flex flex-col items-start gap-0.5 p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/60 hover:shadow-sm transition-all text-left"
              >
                <span className="text-base leading-none">{preset.emoji}</span>
                <span className="text-xs font-bold text-slate-700 group-hover:text-sky-700 mt-1">
                  {preset.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Day Rows ─────────────────────────────────────────────────────── */}
        <div className="divide-y divide-slate-100">
          {schedule.map((day, idx) => (
            <div
              key={day.name}
              className={`transition-colors duration-150 ${
                day.enabled ? "bg-white" : "bg-slate-50/30"
              }`}
            >
              {/* ── Day Header Row ─────────────────────────────────────── */}
              <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(idx)}
                  aria-label={`Toggle ${day.name}`}
                  className={`w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative shadow-inner ${
                    day.enabled ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-200 ${
                      day.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>

                {/* Day name */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-bold ${
                      day.enabled ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {day.name}
                  </span>
                  {/* Summary when collapsed */}
                  {day.enabled && !day.expanded && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                      {day.sessions
                        .map(
                          (s) => `${formatTime(s.startTime)}–${formatTime(s.endTime)}`
                        )
                        .join(" · ")}{" "}
                      · {day.slotDurationMinutes} min slots
                    </p>
                  )}
                  {!day.enabled && (
                    <p className="text-xs text-slate-300 mt-0.5">Closed</p>
                  )}
                </div>

                {/* Expand/collapse — only when enabled */}
                {day.enabled && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                  >
                    {day.expanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* ── Expanded Editor ────────────────────────────────────── */}
              {day.enabled && day.expanded && (
                <div className="px-4 sm:px-6 pb-5 space-y-4">
                  {/* Sessions */}
                  {day.sessions.map((session, si) => (
                    <div key={si} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-20 flex-shrink-0">
                          {si === 0 ? "Session 1" : "Session 2"}
                        </span>
                        {si > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSession(idx, si)}
                            className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                            From
                          </label>
                          <TimeInput
                            value={session.startTime}
                            onChange={(v) =>
                              updateSession(idx, si, "startTime", v)
                            }
                          />
                        </div>
                        <div className="text-slate-300 font-bold mt-5 flex-shrink-0">
                          →
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mb-1">
                            To
                          </label>
                          <TimeInput
                            value={session.endTime}
                            onChange={(v) =>
                              updateSession(idx, si, "endTime", v)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add session button */}
                  {day.sessions.length < 2 && (
                    <button
                      type="button"
                      onClick={() => addSession(idx)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-sky-300 text-sky-600 text-sm font-semibold hover:bg-sky-50 hover:border-sky-400 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Break / Evening Session
                    </button>
                  )}

                  {/* Slot Duration */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mb-2">
                      Appointment Slot Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SLOT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSlotDuration(idx, opt.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            day.slotDurationMinutes === opt.value
                              ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/30"
                              : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply to all */}
                  <button
                    type="button"
                    onClick={() => applyToAll(idx)}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Apply this schedule to all working days
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Save Button ───────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <Button
            onClick={onSave}
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all active:scale-[0.99]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Working Hours"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
