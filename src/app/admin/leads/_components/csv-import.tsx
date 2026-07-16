"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { bulkInsertLeads } from "../actions";

export function CsvImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          // Normalize column names loosely
          const formattedLeads = data.map(row => {
            const getVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => keys.some(searchKey => k.toLowerCase().includes(searchKey)));
              return foundKey ? row[foundKey] : undefined;
            };

            return {
              doctorName: getVal(["doctor", "name", "dr"]),
              clinicName: getVal(["clinic", "hospital", "practice"]),
              phone: getVal(["phone", "mobile", "contact", "number"]),
              specialty: getVal(["specialty", "type"]),
              city: getVal(["city", "location"]),
              address: getVal(["address"]),
            };
          }).filter(l => l.phone); // Phone is required

          if (formattedLeads.length === 0) {
            toast.error("No valid leads found. Please ensure your CSV has a 'Phone' column.");
            setIsUploading(false);
            return;
          }

          const res = await bulkInsertLeads(formattedLeads);
          if (res.success) {
            toast.success(`Successfully imported ${res.count} leads`);
            setIsOpen(false);
          } else {
            toast.error(res.error || "Failed to import");
          }
        } catch (error) {
          toast.error("Failed to parse CSV");
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: () => {
        toast.error("Error reading file");
        setIsUploading(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white">
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your doctor leads. The system will automatically try to match columns for Doctor Name, Clinic Name, Phone, Specialty, City, and Address.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          {isUploading ? (
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-600">Processing file...</p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto border border-slate-200">
                <FileSpreadsheet className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Click to upload CSV</p>
                <p className="text-xs text-slate-500 mt-1">Maximum file size: 5MB</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
