"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PresetsManagerProps {
  title: string;
  description: string;
  placeholder?: string;
  items: string[];
  onChange: (newItems: string[]) => void;
  themeColor: string;
}

export function PresetsManager({
  title,
  description,
  placeholder = "Add preset...",
  items,
  onChange,
  themeColor,
}: PresetsManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const val = inputValue.trim();
    if (val && !items.includes(val)) {
      onChange([...items, val]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(items.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div>
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          {title}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 rounded-xl text-sm shadow-inner bg-white border-slate-200"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="h-10 px-3 rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-transform active:scale-95"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {items.map((item) => (
            <div
              key={item}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 shadow-sm transition-all"
            >
              <span className="text-slate-700">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-2 text-xs text-slate-400 italic">No presets added yet.</div>
      )}
    </div>
  );
}
