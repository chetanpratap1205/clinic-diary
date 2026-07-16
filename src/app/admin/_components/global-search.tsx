"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, FileText, Target, Calendar, MapPin, Phone, Command as CommandIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "clinic" | "partner" | "lead";
  href: string;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch results based on query
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors min-w-[240px]"
      >
        <Search className="w-4 h-4" />
        <span>Search anything...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-300 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <Command 
                className="w-full flex flex-col"
                shouldFilter={false} // We filter on the server
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              >
                <div className="flex items-center border-b border-slate-100 px-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <Command.Input 
                    value={query}
                    onValueChange={setQuery}
                    autoFocus
                    placeholder="Search clinics, partners, leads..."
                    className="flex h-14 w-full rounded-md bg-transparent px-3 text-base outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {loading && (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin shrink-0" />
                  )}
                  <button 
                    onClick={() => setOpen(false)}
                    className="ml-2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
                  >
                    ESC
                  </button>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                  {!loading && query && results.length === 0 && (
                    <Command.Empty className="py-12 text-center text-sm text-slate-500">
                      No results found for "{query}".
                    </Command.Empty>
                  )}

                  {!query && (
                    <Command.Group heading="Quick Links" className="text-xs font-semibold text-slate-500 px-2 py-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                      <Command.Item 
                        onSelect={() => handleSelect('/admin/clinics')}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-teal-50 aria-selected:text-teal-900 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-teal-100 text-teal-700 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">View All Clinics</p>
                          <p className="text-xs text-slate-500">Manage subscriptions and performance</p>
                        </div>
                      </Command.Item>
                      
                      <Command.Item 
                        onSelect={() => handleSelect('/admin/partners')}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-900 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">Growth Partners</p>
                          <p className="text-xs text-slate-500">Manage sales teams and payouts</p>
                        </div>
                      </Command.Item>
                    </Command.Group>
                  )}

                  {results.length > 0 && (
                    <Command.Group heading="Search Results" className="text-xs font-semibold text-slate-500 px-2 py-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-500">
                      {results.map((result) => (
                        <Command.Item
                          key={result.id}
                          onSelect={() => handleSelect(result.href)}
                          className="flex items-center gap-3 px-3 py-3 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-colors mb-1"
                        >
                          {result.type === "clinic" && (
                            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                          {result.type === "partner" && (
                            <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                          )}
                          {result.type === "lead" && (
                            <div className="w-8 h-8 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Target className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{result.title}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{result.subtitle}</p>
                          </div>
                          <div className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {result.type}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                </Command.List>
                
                {/* Search Footer */}
                <div className="border-t border-slate-100 p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><CommandIcon className="w-3 h-3" /> to select</span>
                    <span className="flex items-center gap-1.5"><kbd className="font-mono bg-slate-200 px-1 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-slate-200 px-1 rounded text-[10px]">↓</kbd> to navigate</span>
                  </div>
                  <span className="font-semibold text-slate-400">Doctor Diary</span>
                </div>
              </Command>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
