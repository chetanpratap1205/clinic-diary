"use client";

import { useState } from "react";
import { X, BookOpen, MessageCircle, Target, Lightbulb, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DecisionGuideModalProps {
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DecisionGuideModal({ onClose, open, onOpenChange }: DecisionGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"playbook" | "replies" | "usps" | "rules">("playbook");
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
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">Sales & Outreach Playbook</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Psychology, USPs, and Objection Handling</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0 gap-2 pt-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          {[
            { id: "playbook", label: "🎯 3-Step Playbook", icon: Target },
            { id: "replies", label: "💬 Handling Replies", icon: MessageCircle },
            { id: "usps", label: "⚡ Pain Points & USPs", icon: ShieldCheck },
            { id: "rules", label: "🧠 Psychology Rules", icon: Lightbulb },
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

          {/* TAB 1: PLAYBOOK */}
          {activeTab === "playbook" && (
            <div className="space-y-5">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> The Universal Outreach Sequence
                </h3>
                <p className="text-xs text-teal-700 leading-relaxed">
                  We no longer segment leads by complex categories. Every lead receives this high-converting, psychologically engineered 3-step sequence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Step 1: The Hook</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Day 1</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Goal: Grab attention by exposing a leak.</p>
                  <ul className="text-xs space-y-2 text-slate-600 list-disc pl-4 mt-2">
                    <li>We point out they are losing patients because they lack a booking link on Google Maps.</li>
                    <li>We present the custom booking app we built for them.</li>
                    <li>We link a 60-second explainer video.</li>
                  </ul>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Step 2: The Proof</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Day 3</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Goal: Build trust and remove friction.</p>
                  <ul className="text-xs space-y-2 text-slate-600 list-disc pl-4 mt-2">
                    <li>Highlight the 50% increase in patients for other clinics.</li>
                    <li>Emphasize 0% commission & keeping their paper Rx pad.</li>
                    <li>Price anchor: "Less than a cup of tea per day."</li>
                  </ul>
                </div>

                <div className="border border-red-200 bg-red-50/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Step 3: Clean Exit</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Day 6</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2 font-medium">Goal: Force action through FOMO & Scarcity.</p>
                  <ul className="text-xs space-y-2 text-slate-600 list-disc pl-4 mt-2">
                    <li>We are limiting this technology to a few premium clinics.</li>
                    <li>Give a 48-hour deadline before the spot is given to a competitor.</li>
                    <li>Push for the "ACTIVATE" reply.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPLIES & OBJECTIONS */}
          {activeTab === "replies" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a doctor replies, your goal is <strong>NOT</strong> to sell the software. Your goal is to get them to activate the <strong>14-Day Free Trial</strong>. Here is how to handle common objections:
                </p>
              </div>

              {[
                { 
                  obj: "What does it cost? / Is it expensive?", 
                  ans: "Never give a raw number immediately. Frame it: 'It costs less than a cup of tea per day. We charge 0% commission on patient bookings. Let's start your 14-day free trial so you can see the ROI yourself.'" 
                },
                { 
                  obj: "Migrating data is a headache / Too hard to switch", 
                  ans: "Pitch the White-Glove Migration. 'You don't have to do anything. Just send us your Excel sheets, and our engineering team will transfer 100% of your records in 48 hours with zero downtime.'" 
                },
                { 
                  obj: "My receptionist won't learn new software", 
                  ans: "Emphasize zero friction. 'You don't need to change your routine. You can keep writing on your regular paper Rx pad, and our system automatically creates the digital copy. Zero staff training needed.'" 
                },
                { 
                  obj: "I am already listed on Practo / JustDial", 
                  ans: "Position against aggregators. 'Those platforms charge you 15-30% commissions and show competitors next to your name. We give you an independent platform where you own your patients and keep 100% of the fees.'" 
                },
              ].map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <h4 className="font-bold text-red-600 text-sm mb-2">"{item.obj}"</h4>
                  <p className="text-xs text-slate-700 font-medium">Response Strategy:</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">{item.ans}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: USPS & PAIN POINTS */}
          {activeTab === "usps" && (
            <div className="space-y-4">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold border-b border-slate-200">Doctor's Pain Point</th>
                    <th className="px-4 py-3 font-bold border-b border-slate-200">Our USP (Solution)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-600">Losing patients after hours because clinic phone is unanswered.</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">24x7x365 Booking via Google Maps, Instagram, and Clinic QR code.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-600">Aggregators taking 15-30% cuts on every patient visit.</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">0% Commission. They keep 100% of the earnings.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-600">Too busy to learn complex digital prescription software.</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">Keep writing on paper Rx pad. System handles digital copy automatically.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-600">Patients miss follow-up appointments.</td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">1-click automated WhatsApp reminders reduce no-shows.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: PSYCHOLOGICAL RULES */}
          {activeTab === "rules" && (
            <div className="space-y-4">
              {[
                { title: "1. Never use 'Sir' or 'Ma'am'", desc: "Use 'Dr. [LastName]'. Indian doctors view 'Sir' as vendor submission, whereas 'Dr.' establishes peer-to-peer professional respect." },
                { title: "2. Speed is King for Replies", desc: "If a doctor replies 'YES' or asks a question, reply within 5 minutes. Strike while their attention is on you." },
                { title: "3. Don't Overexplain", desc: "Keep replies extremely short. If they ask a highly complex technical question, do not type a paragraph. Ask: 'Can we hop on a quick 2-minute call to explain?'" },
                { title: "4. The Goal is the Trial", desc: "Your objective on WhatsApp is not to collect money. Your objective is to get them to say 'YES' to activating the 14-day free trial." },
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
