"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, QrCode, Link as LinkIcon, Download } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { createMarketingCampaign } from "./actions";
import { Badge } from "@/components/ui/badge";

export function MarketingClient({ campaigns }: { campaigns: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "qr",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createMarketingCampaign(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Campaign created successfully!");
        setIsOpen(false);
        setFormData({ name: "", code: "", type: "qr", notes: "" });
      }
    });
  };

  const handleDownloadQR = async (code: string, name: string) => {
    try {
      // Get absolute URL for the QR code
      const baseUrl = window.location.origin;
      const trackingUrl = `${baseUrl}/m/${code}`;
      
      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 1200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: "H",
      });
      
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `QR_Campaign_${name.replace(/\s+/g, '_')}_${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR Code downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR code.");
    }
  };

  const copyToClipboard = (code: string) => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/m/${code}`);
    toast.success("Tracking link copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Campaigns</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input 
                  required 
                  placeholder="e.g. Pune Medical Expo 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tracking Code</Label>
                <Input 
                  required 
                  placeholder="e.g. PUNE-EXPO-26"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '-')})}
                />
                <p className="text-xs text-slate-500">This will be part of the URL: /m/CODE</p>
              </div>

              <div className="space-y-2">
                <Label>Medium Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr">Physical QR (Pamphlet/Standee)</SelectItem>
                    <SelectItem value="link">Digital Link (Social/Ads)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input 
                  placeholder="e.g. 500 pamphlets printed"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Campaign
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto min-w-full">
        <div className="min-w-[700px]">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="whitespace-nowrap">Campaign</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right whitespace-nowrap">Scans/Clicks</TableHead>
              <TableHead className="text-right whitespace-nowrap">Signups</TableHead>
              <TableHead className="text-right whitespace-nowrap hidden md:table-cell">Conversion</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No campaigns found. Create one to start tracking!
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="min-w-[150px] truncate">
                    <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                    <div className="flex items-center text-xs text-slate-500 mt-1 font-mono bg-slate-100 w-fit px-1.5 rounded truncate">
                      /m/{c.code}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize text-slate-600 whitespace-nowrap">
                      {c.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap">{c.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 whitespace-nowrap">{c.signups.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-slate-600 whitespace-nowrap hidden md:table-cell">
                    {c.clicks > 0 ? ((c.signups / c.clicks) * 100).toFixed(1) : "0"}%
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(c.code)}>
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDownloadQR(c.code, c.name)}>
                        <QrCode className="w-4 h-4 mr-2" /> QR
                      </Button>
                    </div>
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
