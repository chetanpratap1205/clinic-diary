"use client";

import { useState, useRef, useTransition } from "react";
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { importLeads } from "./actions";

interface CsvImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

interface ParsedRow {
  doctorName: string;
  clinicName?: string;
  phone: string;
  email?: string;
  specialty?: string;
  city?: string;
  address?: string;
  source?: string;
  leadCategory?: string;
}

type ImportResult = { added: number; skipped: number; errors: number };

// Smart CSV column header mapping
const HEADER_MAP: Record<string, keyof ParsedRow> = {
  "doctor name": "doctorName",
  "doctor": "doctorName",
  "name": "doctorName",
  "dr name": "doctorName",
  "dr. name": "doctorName",
  "clinic name": "clinicName",
  "clinic": "clinicName",
  "hospital": "clinicName",
  "phone": "phone",
  "mobile": "phone",
  "phone number": "phone",
  "mobile number": "phone",
  "contact": "phone",
  "whatsapp": "phone",
  "email": "email",
  "email id": "email",
  "specialty": "specialty",
  "speciality": "specialty",
  "specialization": "specialty",
  "domain": "specialty",
  "city": "city",
  "location": "city",
  "town": "city",
  "address": "address",
  "source": "source",
  "category": "leadCategory",
  "lead category": "leadCategory",
  "type": "leadCategory",
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/"/g, "").trim().toLowerCase());

  const colMap: Record<number, keyof ParsedRow> = {};
  headers.forEach((h, i) => {
    const key = HEADER_MAP[h];
    if (key) colMap[i] = key;
  });

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
    if (cells.every((c) => !c)) continue;

    const row: Partial<ParsedRow> = {};
    cells.forEach((cell, idx) => {
      const key = colMap[idx];
      if (key && cell) row[key] = cell;
    });

    if (row.doctorName || row.phone) {
      rows.push({
        doctorName: row.doctorName || "Unknown Doctor",
        clinicName: row.clinicName,
        phone: row.phone || "",
        email: row.email,
        specialty: row.specialty,
        city: row.city,
        address: row.address,
        source: "imported",
        leadCategory: row.leadCategory || "A",
      });
    }
  }
  return rows;
}

export function CsvImportModal({ onClose, onImported }: CsvImportModalProps) {
  const [isPending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);
      if (rows.length === 0) {
        toast.error("No valid rows found. Check your CSV format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) {
      toast.error("No rows to import");
      return;
    }
    startTransition(async () => {
      const res = await importLeads(parsedRows);
      setResult(res);
      toast.success(`Import complete: ${res.added} added, ${res.skipped} skipped`);
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] sm:w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Import Leads from CSV</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload your Excel-exported CSV file</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {/* Format Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 mb-2">Accepted CSV Column Headers:</p>
            <div className="flex flex-wrap gap-1.5">
              {["Doctor Name", "Clinic Name", "Phone", "Email", "Specialty", "City", "Address", "Category"].map((h) => (
                <span key={h} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-mono">
                  {h}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-500 mt-2">
              ✓ Doctor Name and Phone are required. All other columns are optional.
              <br />✓ Category: A (Cold), B (Visited), C (Inbound). Defaults to A if not set.
            </p>
          </div>

          {/* Drop Zone */}
          {!parsedRows.length && !result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-teal-400 bg-teal-50"
                  : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
              }`}
            >
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-slate-400 mt-1">Only .csv files supported</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          )}

          {/* Preview */}
          {parsedRows.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-slate-700">{fileName}</span>
                </div>
                <span className="text-sm font-bold text-teal-700">{parsedRows.length} rows detected</span>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Preview (first 5 rows)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">Doctor</th>
                        <th className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">Phone</th>
                        <th className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">Specialty</th>
                        <th className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">City</th>
                        <th className="text-left px-3 py-2 text-slate-400 font-medium whitespace-nowrap">Cat.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-slate-700 max-w-[140px] truncate">{row.doctorName}</td>
                          <td className="px-3 py-2 text-slate-500 font-mono">{row.phone || "—"}</td>
                          <td className="px-3 py-2 text-slate-500 max-w-[100px] truncate">{row.specialty || "—"}</td>
                          <td className="px-3 py-2 text-slate-500">{row.city || "—"}</td>
                          <td className="px-3 py-2">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                              {row.leadCategory || "A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 5 && (
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                    <p className="text-xs text-slate-400">
                      + {parsedRows.length - 5} more rows not shown in preview
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠ Duplicate phone numbers will be automatically skipped. No existing leads will be overwritten.
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="font-bold text-emerald-700">Import Complete!</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-xl border border-emerald-200 p-3">
                    <p className="text-2xl font-bold text-emerald-600">{result.added}</p>
                    <p className="text-xs text-slate-500 mt-1">Leads Added</p>
                  </div>
                  <div className="bg-white rounded-xl border border-amber-200 p-3">
                    <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                    <p className="text-xs text-slate-500 mt-1">Skipped (Duplicates)</p>
                  </div>
                  <div className="bg-white rounded-xl border border-red-200 p-3">
                    <p className="text-2xl font-bold text-red-600">{result.errors}</p>
                    <p className="text-xs text-slate-500 mt-1">Errors</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
          {result ? (
            <Button onClick={onImported} className="flex-1 bg-teal-600 hover:bg-teal-700 h-10">
              View All Leads
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1 h-10" disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                className="flex-1 bg-teal-600 hover:bg-teal-700 h-10 gap-2"
                disabled={parsedRows.length === 0 || isPending}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Import {parsedRows.length > 0 ? `${parsedRows.length} Leads` : "Leads"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
