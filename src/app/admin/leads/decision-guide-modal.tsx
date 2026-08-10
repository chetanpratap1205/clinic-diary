"use client";

import { useState } from "react";
import { X, BookOpen, Clock, Target, Lightbulb, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DecisionGuideModalProps {
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DecisionGuideModal({ onClose, open, onOpenChange }: DecisionGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "rules" | "hooks" | "timing">("matrix");
  const handleClose = () => { onClose?.(); onOpenChange?.(false); };

  if (open === false) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] sm:w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">Sales & Outreach Decision Guide</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Psychology & message selection matrix</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0 gap-2 pt-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          {[
            { id: "matrix", label: "🎯 Which Message to Pick", icon: Target },
            { id: "timing", label: "⏱️ Sequence Timing", icon: Clock },
            { id: "rules", label: "💡 Psychological Rules", icon: Lightbulb },
            { id: "hooks", label: "🩺 Specialty Hooks", icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-t border-x -mb-px ${
                  isActive
                    ? "bg-white border-slate-200 text-teal-700 font-bold shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: DECISION MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-5">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Core Rule of Category Selection
                </h3>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Never guess the category. The lead&apos;s <strong>first point of origin</strong> determines the category.
                  Tagting correctly on Day 1 boosts conversion by 3x because the tone matches their familiarity with us.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Doctor Situation / Lead Origin</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Start Message</th>
                      <th className="px-4 py-3 text-left">Domain Hook Required?</th>
                      <th className="px-4 py-3 text-left">Primary Goal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Found on Google Maps / Directory / Association List</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">Category A</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">A1 (Opening Strike)</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">YES (Mandatory)</td>
                      <td className="px-4 py-3 text-slate-500">Loss aversion + Test login ask</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Receptionist met in-person by field rep</td>
                      <td className="px-4 py-3"><span className="bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded">Category B</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-600">B1 (Post-Visit)</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">YES (Mandatory)</td>
                      <td className="px-4 py-3 text-slate-500">Leverage visit + 3-min call ask</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Doctor met in-person by field rep / founder</td>
                      <td className="px-4 py-3"><span className="bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded">Category B</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-600">B1 (Post-Visit)</td>
                      <td className="px-4 py-3 text-emerald-700 font-bold">YES (Mandatory)</td>
                      <td className="px-4 py-3 text-slate-500">Fulfill promise + Share Rx feature</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Filled Facebook / Instagram / Google Ad Form</td>
                      <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">Category C</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-600">C1 (Within 15 mins)</td>
                      <td className="px-4 py-3 text-slate-400">Optional</td>
                      <td className="px-4 py-3 text-slate-500">High speed response + Ask friction point</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">Messaged our WhatsApp number first</td>
                      <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">Category C</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-600">C1 (Within 15 mins)</td>
                      <td className="px-4 py-3 text-slate-400">Optional</td>
                      <td className="px-4 py-3 text-slate-500">Instant friction discovery call</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: TIMING */}
          {activeTab === "timing" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
                  <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Category A (Cold)</span>
                  <h4 className="font-bold text-slate-900 mt-2 mb-1">Cold Outreach Cadence</h4>
                  <ul className="text-xs space-y-2 text-slate-600 mt-3">
                    <li className="flex items-center gap-2"><span className="font-bold text-blue-600">Step 1:</span> Day 1 (Demo + Prospectus)</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-amber-600">Step 2:</span> Day 4 (Social Proof Nudge)</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-red-600">Step 3:</span> Day 8 (Clean Exit)</li>
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-200 pt-2">After Step 3: 30-day quiet period, then feature update.</p>
                </div>

                <div className="border border-teal-200 bg-teal-50/50 rounded-xl p-4">
                  <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Category B (Visited)</span>
                  <h4 className="font-bold text-slate-900 mt-2 mb-1">Field Visit Cadence</h4>
                  <ul className="text-xs space-y-2 text-slate-600 mt-3">
                    <li className="flex items-center gap-2"><span className="font-bold text-blue-600">Step 1:</span> Same Day Evening</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-amber-600">Step 2:</span> Day 3 (Receptionist Angle)</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-red-600">Step 3:</span> Day 7 (Personal Setup Offer)</li>
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-3 border-t border-teal-200 pt-2">Same-day follow-up strikes while human memory is fresh.</p>
                </div>

                <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4">
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Category C (Inbound)</span>
                  <h4 className="font-bold text-slate-900 mt-2 mb-1">Inbound Lead Cadence</h4>
                  <ul className="text-xs space-y-2 text-slate-600 mt-3">
                    <li className="flex items-center gap-2"><span className="font-bold text-emerald-600">Step 1:</span> Within 15 Mins (Crucial!)</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-amber-600">Step 2:</span> Day 2 (ROI Breakdown)</li>
                    <li className="flex items-center gap-2"><span className="font-bold text-purple-600">Step 3:</span> Day 5 (Founder Setup Close)</li>
                  </ul>
                  <p className="text-[11px] text-slate-400 mt-3 border-t border-purple-200 pt-2">Speed is 80% of conversion for inbound leads.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PSYCHOLOGICAL RULES */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              {[
                { title: "1. Never use 'Sir' or 'Ma'am'", desc: "Use 'Respected Dr. [LastName]' only. Indian doctors view 'Sir' as vendor submission, whereas 'Respected Dr.' establishes peer-to-peer professional respect." },
                { title: "2. First line must contain a statistic or direct question", desc: "Never open with 'Hi, I am from XYZ company'. Doctors instantly archive pitches. Open with a pain metric like 'Most clinics lose 15-20% follow-ups...'." },
                { title: "3. Company name appears LAST", desc: "Doctor Diary is placed at the bottom near signoff. This ensures the doctor reads the value proposition before filtering it as an advertisement." },
                { title: "4. One single CTA per message", desc: "Never ask: 'Can we talk or should I send a demo or try the link?'. Give exactly ONE low-friction action (e.g. 'Can I send a test login?')." },
                { title: "5. Max 9-10 lines on phone screen", desc: "If WhatsApp truncates your message with '[Read More]', response rates drop by 50%. Keep formatting tight with clean bullet points." },
              ].map((r, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 3 MASTER PRACTICE TYPES */}
          {activeTab === "hooks" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-600">
                  Instead of 10 fragmented specialty scripts, Doctor Diary groups all doctors into <strong>3 Master Practice Types</strong>. This keeps your outreach simple, powerful, and 100% relevant.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">1. High-Volume OPD</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">30-sec Rx Speed</span>
                  </div>
                  <p className="text-[11px] text-slate-500">GP, Pediatrics, ENT, Eyecare / Ophthalmology, Internal Med, Polyclinics</p>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-blue-100 leading-relaxed">
                    &ldquo;Writing prescriptions by hand is familiar, but managing 40+ OPD patients a day still costs your clinic over 90 minutes in administrative delay... Doctor Diary generates a branded digital Rx in under 30 seconds (faster than pen & paper) and delivers it straight to WhatsApp.&rdquo;
                  </p>
                </div>

                <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">2. Procedure & Recall</span>
                    <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold">Treatment Recall</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Dermatology, Aesthetics, Dental, Orthopedics, Physiotherapy, IVF</p>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-teal-100 leading-relaxed">
                    &ldquo;The single biggest revenue leak in procedure & multi-sitting clinics isn&apos;t competition — it&apos;s patients who start a treatment plan and quietly stop coming back after 2 visits... Doctor Diary automates WhatsApp treatment recalls and Google reviews.&rdquo;
                  </p>
                </div>

                <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">3. Chronic & Continuity</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">Return Compliance</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Gynecology, Cardiology, Diabetology, Psychiatry, Neurology</p>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-purple-100 leading-relaxed">
                    &ldquo;On average, chronic and continuous care practices lose 15–20% of follow-up consultations simply because patients forget their return date or misplace their paper prescription... Doctor Diary automates patient return alerts on WhatsApp.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Doctor Diary Sales Playbook &bull; Onboarding Team</span>
          <Button size="sm" onClick={handleClose} className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
            Close Guide
          </Button>
        </div>
      </div>
    </>
  );
}
