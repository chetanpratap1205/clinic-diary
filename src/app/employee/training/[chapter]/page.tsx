export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { chapterMap, chapters, colorMap } from "../_data/chapters";
import { ScriptBlock } from "../_components/ScriptBlock";
import { ObjectionCard } from "../_components/ObjectionCard";
import { WhatsAppTemplate } from "../_components/WhatsAppTemplate";
import type { ContentBlock } from "../_data/chapters";

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { chapter: slug } = await params;
  const chap = chapterMap[slug];
  if (!chap) return {};
  return {
    title: `${chap.emoji} ${chap.title} — Doctor Diary Sales Training`,
  };
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "highlight":
      return (
        <div
          key={index}
          className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-xl p-4 sm:p-5 border-l-4 border-teal-400"
        >
          <p className="text-sm sm:text-base font-semibold text-teal-100 leading-relaxed italic">
            {block.text}
          </p>
        </div>
      );

    case "heading":
      return (
        <h2
          key={index}
          className="text-base sm:text-lg font-extrabold text-slate-900 mt-6 mb-2 flex items-start gap-2"
        >
          <span className="text-teal-500 mt-0.5">▸</span>
          {block.title}
        </h2>
      );

    case "subheading":
      return (
        <h3
          key={index}
          className="text-sm font-bold text-slate-700 mt-4 mb-1.5"
        >
          {block.title}
        </h3>
      );

    case "para":
      return (
        <p key={index} className="text-sm text-slate-700 leading-relaxed">
          {block.text}
        </p>
      );

    case "script":
      return (
        <ScriptBlock
          key={index}
          lines={block.lines ?? []}
          title={block.title}
        />
      );

    case "objection-list":
      return (
        <ObjectionCard key={index} objections={block.objections ?? []} />
      );

    case "whatsapp-template":
      return (
        <WhatsAppTemplate
          key={index}
          label={block.templateLabel ?? ""}
          text={block.templateText ?? ""}
        />
      );

    case "checklist":
      return (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {block.title && (
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {block.title}
              </p>
            </div>
          )}
          <ul className="divide-y divide-slate-100">
            {(block.items ?? []).map((item, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-emerald-500 mt-0.5 text-base shrink-0">
                  ✓
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "numbered-list":
      return (
        <div key={index} className="space-y-2">
          {block.title && (
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              {block.title}
            </p>
          )}
          <ol className="space-y-2">
            {(block.items ?? []).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "tip-box":
      return (
        <div
          key={index}
          className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3"
        >
          <span className="text-blue-500 text-xl shrink-0">💡</span>
          <p className="text-sm text-blue-900 leading-relaxed font-medium">
            {block.text}
          </p>
        </div>
      );

    case "warning-box":
      return (
        <div
          key={index}
          className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3"
        >
          <span className="text-red-500 text-xl shrink-0">⚠️</span>
          <p className="text-sm text-red-900 leading-relaxed font-medium">
            {block.text}
          </p>
        </div>
      );

    case "divider":
      return <hr key={index} className="border-slate-200 my-4" />;

    default:
      return null;
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapter: slug } = await params;
  const chap = chapterMap[slug];
  if (!chap) notFound();

  const currentIndex = chapters.findIndex((c) => c.slug === slug);
  const prevChap = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChap =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const colors = colorMap[chap.color] ?? colorMap.teal;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back Button */}
      <Link
        href="/employee/training"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Training Hub
      </Link>

      {/* Chapter Header */}
      <div
        className={`rounded-2xl p-5 sm:p-6 ${colors.bg} border ${colors.border}`}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl sm:text-5xl">{chap.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}
              >
                Chapter {currentIndex}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {chap.readTime} read
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-extrabold ${colors.text} leading-tight`}>
              {chap.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{chap.tagline}</p>
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        {chap.blocks.map((block, i) => renderBlock(block, i))}
      </div>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 gap-4">
        {prevChap ? (
          <Link
            href={`/employee/training/${prevChap.slug}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors group flex-1"
          >
            <ChevronLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Previous</p>
              <p className="truncate">
                {prevChap.emoji} {prevChap.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <Link
          href="/employee/training"
          className="shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-100 flex items-center justify-center transition-colors"
          title="All Chapters"
        >
          <span className="text-xs">📚</span>
        </Link>

        {nextChap ? (
          <Link
            href={`/employee/training/${nextChap.slug}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors group flex-1 justify-end text-right"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Next</p>
              <p className="truncate">
                {nextChap.emoji} {nextChap.title}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Completed nudge at end */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-xl p-4 text-center">
        <p className="text-white text-sm font-semibold">
          Chapter complete! 🎉
        </p>
        <p className="text-teal-300 text-xs mt-1">
          Ab isko practice karo — knowledge sirf use se aati hai.
        </p>
        {nextChap && (
          <Link
            href={`/employee/training/${nextChap.slug}`}
            className="inline-block mt-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Next: {nextChap.emoji} {nextChap.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
