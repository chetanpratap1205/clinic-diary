import type { ScriptLine } from "../_data/chapters";

const speakerConfig = {
  you: {
    label: "Aap bolein:",
    bg: "bg-teal-50",
    border: "border-l-4 border-teal-400",
    textColor: "text-teal-900",
    labelColor: "text-teal-600",
    labelBg: "bg-teal-100",
  },
  them: {
    label: "Woh bolenge:",
    bg: "bg-slate-50",
    border: "border-l-4 border-slate-300",
    textColor: "text-slate-800",
    labelColor: "text-slate-600",
    labelBg: "bg-slate-100",
  },
  note: {
    label: "💡 Note:",
    bg: "bg-amber-50",
    border: "border-l-4 border-amber-400",
    textColor: "text-amber-900",
    labelColor: "text-amber-700",
    labelBg: "bg-amber-100",
  },
  tip: {
    label: "✨ Pro Tip:",
    bg: "bg-blue-50",
    border: "border-l-4 border-blue-400",
    textColor: "text-blue-900",
    labelColor: "text-blue-700",
    labelBg: "bg-blue-100",
  },
  warning: {
    label: "⚠️ Warning:",
    bg: "bg-red-50",
    border: "border-l-4 border-red-400",
    textColor: "text-red-900",
    labelColor: "text-red-700",
    labelBg: "bg-red-100",
  },
};

interface ScriptBlockProps {
  lines: ScriptLine[];
  title?: string;
}

export function ScriptBlock({ lines, title }: ScriptBlockProps) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {title && (
        <div className="bg-slate-800 px-4 py-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            🎭 {title}
          </span>
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {lines.map((line, i) => {
          const config = speakerConfig[line.speaker];
          return (
            <div
              key={i}
              className={`${config.bg} ${config.border} px-4 py-3 flex flex-col gap-1`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${config.labelColor} px-1.5 py-0.5 rounded ${config.labelBg} w-fit`}
              >
                {config.label}
              </span>
              <p className={`text-sm leading-relaxed ${config.textColor} font-medium`}>
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
