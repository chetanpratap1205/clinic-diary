"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { bulkUploadDirectory } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function DirectoryClient({ unclaimedClinics }: { unclaimedClinics: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast.error("Error parsing CSV file");
            console.error(results.errors);
          } else {
            // Validate required columns
            const firstRow = results.data[0] as any;
            if (!firstRow.doctorName || !firstRow.specialty || !firstRow.city || !firstRow.state || !firstRow.address) {
              toast.error("CSV is missing required columns. Ensure it has: doctorName, specialty, city, state, address.");
              setFile(null);
              setPreview([]);
              return;
            }
            setPreview(results.data);
          }
        }
      });
    }
  };

  const handleUpload = () => {
    if (preview.length === 0) return;
    
    startTransition(async () => {
      const res = await bulkUploadDirectory(preview);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setFile(null);
        setPreview([]);
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Uploader Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Bulk Import Doctors (CSV)</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="max-w-sm"
          />
          <Button 
            onClick={handleUpload}
            disabled={preview.length === 0 || isPending}
            className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload {preview.length > 0 ? `${preview.length} Records` : ""}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Required columns: <code className="bg-slate-100 px-1 py-0.5 rounded">doctorName</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">specialty</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">city</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">state</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">address</code>. Optional: <code className="bg-slate-100 px-1 py-0.5 rounded">clinicName</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">phone</code>.
        </p>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[600px]">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 min-w-[600px]">
          <h3 className="font-semibold text-slate-900 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-slate-500" />
            Unclaimed Clinics Directory
          </h3>
          <Badge variant="secondary">{unclaimedClinics.length} Entries</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Doctor & Clinic</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">Location</TableHead>
              <TableHead className="hidden sm:table-cell whitespace-nowrap">Specialty</TableHead>
              <TableHead className="hidden md:table-cell whitespace-nowrap">SEO Slug</TableHead>
              <TableHead className="text-right whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unclaimedClinics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No directory entries found. Upload a CSV to get started.
                </TableCell>
              </TableRow>
            ) : (
              unclaimedClinics.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-semibold text-slate-900 min-w-[150px] truncate">{c.doctorName}</p>
                    <p className="text-xs text-slate-500 truncate">{c.clinicName}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-sm whitespace-nowrap">{c.city}, {c.state}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="whitespace-nowrap">{c.specialty}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a href={`/directory/${c.city.toLowerCase()}/${c.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-mono truncate max-w-[150px] block">
                      /{c.slug} ↗
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.isClaimed ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Claimed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                        Unclaimed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

    </div>
  );
}
