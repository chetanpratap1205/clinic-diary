import { MessageSquare } from "lucide-react";
import { CopyButton } from "./CopyButton";

interface WhatsAppTemplateProps {
  label: string;
  text: string;
}

export function WhatsAppTemplate({ label, text }: WhatsAppTemplateProps) {
  return (
    <div className="rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-emerald-700 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold text-white truncate">{label}</span>
        </div>
        <CopyButton text={text} label="Copy Message" className="shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20" />
      </div>

      {/* Phone-style message bubble */}
      <div className="bg-[#e9f5ec] p-4">
        <div className="bg-white rounded-xl rounded-tl-none shadow-sm px-4 py-3 max-w-sm ml-0 mr-auto border border-emerald-100">
          <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed break-words">
            {text}
          </pre>
          <div className="text-right mt-1">
            <span className="text-[10px] text-slate-400">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
