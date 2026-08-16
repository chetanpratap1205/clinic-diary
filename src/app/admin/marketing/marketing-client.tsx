"use client";

import { useState, useTransition, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  QrCode,
  Link as LinkIcon,
  Download,
  Search,
  Pause,
  Play,
  Trash2,
  Edit,
  Share2,
  Sparkles,
  ExternalLink,
  Users,
  Copy,
  Check,
  FileSpreadsheet,
  Globe,
  Tag,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  createMarketingCampaign,
  updateMarketingCampaign,
  toggleCampaignStatus,
  deleteMarketingCampaign,
  getCampaignAttributedClinics,
} from "./actions";

// ─── Field Ops Presets ────────────────────────────────────────────────────────
const FIELD_PRESETS = [
  {
    label: "Doctor Visiting Card",
    type: "visiting_card",
    prefix: "VC",
    utmSource: "field_visit",
    utmMedium: "print_card",
    desc: "Printed QR code on field sales doctor visiting card",
  },
  {
    label: "Prescription Booklet Sticker",
    type: "rx_booklet",
    prefix: "RX",
    utmSource: "rx_booklet",
    utmMedium: "print_sticker",
    desc: "Sticker placed on backcover of prescription pads",
  },
  {
    label: "Reception Acrylic Standee",
    type: "standee",
    prefix: "STAND",
    utmSource: "clinic_reception",
    utmMedium: "acrylic_stand",
    desc: "Pre-printed acrylic standee at reception desk",
  },
  {
    label: "WhatsApp Sales Outreach",
    type: "whatsapp",
    prefix: "WA",
    utmSource: "whatsapp",
    utmMedium: "direct_msg",
    desc: "Direct tracking link sent in WhatsApp pitch messages",
  },
  {
    label: "Digital Ad / Social",
    type: "digital_ad",
    prefix: "AD",
    utmSource: "meta_ads",
    utmMedium: "cpc",
    desc: "Tracking link for Instagram, LinkedIn, or Google Ads",
  },
];

interface MarketingClientProps {
  campaigns: any[];
  scanTrends?: { date: string; count: number }[];
}

export function MarketingClient({ campaigns, scanTrends = [] }: MarketingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<any | null>(null);
  const [qrModalCampaign, setQrModalCampaign] = useState<any | null>(null);
  const [attributionModalCode, setAttributionModalCode] = useState<string | null>(null);
  const [attributedClinics, setAttributedClinics] = useState<any[]>([]);
  const [loadingAttribution, setLoadingAttribution] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "qr",
    status: "active",
    destinationUrl: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmContent: "",
    targetClicks: 100,
    notes: "",
  });

  // QR Modal Customization State
  const [qrColor, setQrColor] = useState("#00B7A8"); // NatureXpress Teal default
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState<number>(1000);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      // Search
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      // Type
      const matchesType = typeFilter === "all" || c.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaigns, searchQuery, statusFilter, typeFilter]);

  // Handle Preset Selector
  const applyPreset = (preset: (typeof FIELD_PRESETS)[0]) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `M-${preset.prefix}-${randomNum}`;

    setFormData((prev) => ({
      ...prev,
      name: `${preset.label} #${randomNum}`,
      code: generatedCode,
      type: preset.type,
      utmSource: preset.utmSource,
      utmMedium: preset.utmMedium,
      utmCampaign: `campaign_${preset.prefix.toLowerCase()}`,
    }));
    toast.info(`Applied preset: ${preset.label}`);
  };

  // Submit Create or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let res;
      if (editCampaign) {
        res = await updateMarketingCampaign(editCampaign.id, formData);
      } else {
        res = await createMarketingCampaign(formData);
      }

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editCampaign ? "Campaign updated ✓" : "Campaign created ✓");
        setCreateOpen(false);
        setEditCampaign(null);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "qr",
      status: "active",
      destinationUrl: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      targetClicks: 100,
      notes: "",
    });
  };

  const openEditModal = (campaign: any) => {
    setEditCampaign(campaign);
    setFormData({
      name: campaign.name,
      code: campaign.code,
      type: campaign.type || "qr",
      status: campaign.status || "active",
      destinationUrl: campaign.destinationUrl || "",
      utmSource: campaign.utmSource || "",
      utmMedium: campaign.utmMedium || "",
      utmCampaign: campaign.utmCampaign || "",
      utmContent: campaign.utmContent || "",
      targetClicks: campaign.targetClicks || 100,
      notes: campaign.notes || "",
    });
    setCreateOpen(true);
  };

  // Toggle Status (Active / Paused)
  const handleToggleStatus = (id: string, currentStatus: string) => {
    startTransition(async () => {
      const res = await toggleCampaignStatus(id, currentStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Campaign ${res.status === "active" ? "Activated" : "Paused"}`);
      }
    });
  };

  // Delete Campaign
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteMarketingCampaign(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Campaign deleted");
      }
    });
  };

  // Copy tracking URL to clipboard
  const copyToClipboard = (code: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctor.naturexpress.in";
    const trackingUrl = `${baseUrl}/m/${code}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Tracking link copied to clipboard 📋");
  };

  // Share via WhatsApp
  const shareWhatsApp = (code: string, name: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctor.naturexpress.in";
    const trackingUrl = `${baseUrl}/m/${code}`;
    const text = `Check out Doctor Diary's exclusive digital clinic portal: ${trackingUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  // High-Res Branded QR Download (PNG)
  const downloadBrandedQR = async (campaign: any) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctor.naturexpress.in";
      const trackingUrl = `${baseUrl}/m/${campaign.code}`;

      const dataUrl = await QRCode.toDataURL(trackingUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor,
        },
        errorCorrectionLevel: "H",
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `QR_Branded_${campaign.name.replace(/\s+/g, "_")}_${campaign.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("High-Res PNG QR Code downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR code.");
    }
  };

  // Download Vector SVG QR
  const downloadSVGQR = async (campaign: any) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://doctor.naturexpress.in";
      const trackingUrl = `${baseUrl}/m/${campaign.code}`;

      const svgString = await QRCode.toString(trackingUrl, {
        type: "svg",
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor,
        },
        errorCorrectionLevel: "H",
      });

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR_Vector_${campaign.name.replace(/\s+/g, "_")}_${campaign.code}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Vector SVG QR Code downloaded for print press!");
    } catch (err) {
      toast.error("Failed to generate SVG QR code.");
    }
  };

  // View Attributed Clinics
  const openAttributionModal = async (code: string) => {
    setAttributionModalCode(code);
    setLoadingAttribution(true);
    const res = await getCampaignAttributedClinics(code);
    if (res.success && res.clinics) {
      setAttributedClinics(res.clinics);
    }
    setLoadingAttribution(false);
  };

  // Export Analytics to CSV
  const exportAnalyticsCSV = () => {
    const headers = [
      "Campaign Name",
      "Tracking Code",
      "Type",
      "Status",
      "Scans/Clicks",
      "Signups",
      "Conversion Rate (%)",
      "Destination URL",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Notes",
      "Created Date",
    ];

    const rows = filteredCampaigns.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.code,
      c.type,
      c.status,
      c.clicks,
      c.signups,
      c.clicks > 0 ? ((c.signups / c.clicks) * 100).toFixed(1) : "0.0",
      `"${(c.destinationUrl || "/").replace(/"/g, '""')}"`,
      c.utmSource || "",
      c.utmMedium || "",
      c.utmCampaign || "",
      `"${(c.notes || "").replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Marketing_Campaigns_Report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Campaign CSV report downloaded 📄");
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            placeholder="Search campaigns, codes, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
          />
        </div>

        {/* Center: Tabs Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
              <TabsTrigger value="paused" className="text-xs">Paused</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="qr">Physical QR</SelectItem>
              <SelectItem value="visiting_card">Visiting Card</SelectItem>
              <SelectItem value="rx_booklet">Rx Booklet</SelectItem>
              <SelectItem value="standee">Reception Standee</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="digital_ad">Digital Ad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Actions (CSV Export & New Campaign) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalyticsCSV}
            className="text-xs gap-1.5 h-9 text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setEditCampaign(null);
              setCreateOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 gap-1.5 font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Campaign & Tracking Code</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Type & Status</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Scans / Clicks</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Signups</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Conversion %</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <QrCode className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No marketing campaigns found</p>
                      <p className="text-xs text-slate-400">Create a new campaign or adjust your search filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((c) => {
                  const convRate = c.clicks > 0 ? ((c.signups / c.clicks) * 100).toFixed(1) : "0.0";
                  const isPaused = c.status === "paused";

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Campaign Name & Code */}
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-snug">{c.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                /m/{c.code}
                              </span>
                              {c.destinationUrl && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate max-w-[120px]" title={c.destinationUrl}>
                                  <Globe className="w-3 h-3" /> {c.destinationUrl}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type & Status Badges */}
                      <TableCell className="min-w-[140px]">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline" className="capitalize text-[11px] text-slate-700 bg-slate-50">
                            {c.type.replace(/_/g, " ")}
                          </Badge>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              c.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : c.status === "paused"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Scans / Clicks */}
                      <TableCell className="text-right font-bold text-slate-900">
                        {c.clicks.toLocaleString()}
                        {c.targetClicks > 0 && (
                          <div className="w-20 ml-auto mt-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-teal-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (c.clicks / c.targetClicks) * 100)}%` }}
                            />
                          </div>
                        )}
                      </TableCell>

                      {/* Signups */}
                      <TableCell className="text-right">
                        <button
                          onClick={() => openAttributionModal(c.code)}
                          className="font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center justify-end gap-1 ml-auto"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          {c.signups.toLocaleString()}
                        </button>
                      </TableCell>

                      {/* Conversion Rate */}
                      <TableCell className="text-right font-bold text-purple-600">
                        {convRate}%
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(c.code)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Copy short tracking link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareWhatsApp(c.code, c.name)}
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQrModalCampaign(c)}
                            className="h-8 px-2 text-xs gap-1 text-slate-700 border-slate-200 hover:bg-slate-50"
                            title="Generate Branded QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-teal-600" />
                            QR
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(c.id, c.status)}
                            className={`h-8 w-8 p-0 ${isPaused ? "text-emerald-600 hover:bg-emerald-50" : "text-amber-600 hover:bg-amber-50"}`}
                            title={isPaused ? "Resume Campaign" : "Pause Campaign"}
                          >
                            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(c)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Edit Campaign"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── CREATE / EDIT CAMPAIGN MODAL ─────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              {editCampaign ? "Edit Marketing Campaign" : "Create Enterprise Marketing Campaign"}
            </DialogTitle>
          </DialogHeader>

          {/* Quick Presets for Field Ops */}
          {!editCampaign && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Field Sales & Ops Quick Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FIELD_PRESETS.map((p) => (
                  <button
                    key={p.prefix}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Campaign Name</Label>
                <Input
                  required
                  placeholder="e.g. Pune Doctor Meet 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tracking Code (Short Code)</Label>
                <Input
                  required
                  disabled={!!editCampaign}
                  placeholder="e.g. PUNE-EXPO-26"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="text-sm font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Medium Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr">Physical QR (General)</SelectItem>
                    <SelectItem value="visiting_card">Doctor Visiting Card</SelectItem>
                    <SelectItem value="rx_booklet">Prescription Booklet</SelectItem>
                    <SelectItem value="standee">Reception Standee</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Outreach</SelectItem>
                    <SelectItem value="digital_ad">Digital Ad (Google/Meta)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Destination URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Destination Redirect Path (Optional)</Label>
              <Input
                placeholder="Default: / (or /signup, /clinic/dr-madhurirani)"
                value={formData.destinationUrl}
                onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                className="text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500">Overrides default home redirect when scanned.</p>
            </div>

            {/* UTM Parameters Builder Accordion */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                UTM Attribution Parameters
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-slate-600">utm_source</Label>
                  <Input
                    placeholder="e.g. google, field_visit"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                    className="text-xs h-8 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600">utm_medium</Label>
                  <Input
                    placeholder="e.g. qr_standee, cpc"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                    className="text-xs h-8 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600">utm_campaign</Label>
                  <Input
                    placeholder="e.g. maharashtra_launch"
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                    className="text-xs h-8 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600">utm_content</Label>
                  <Input
                    placeholder="e.g. reception_stand"
                    value={formData.utmContent}
                    onChange={(e) => setFormData({ ...formData, utmContent: e.target.value })}
                    className="text-xs h-8 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Notes & Comments</Label>
              <Input
                placeholder="e.g. Distributed 200 pamphlets to pediatrician clinics in Kothrud"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-sm"
              />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editCampaign ? "Save Campaign Changes" : "Create Campaign"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── BRANDED QR GENERATOR MODAL ────────────────────────────────────────── */}
      {qrModalCampaign && (
        <Dialog open={!!qrModalCampaign} onOpenChange={() => setQrModalCampaign(null)}>
          <DialogContent className="w-[95vw] sm:max-w-[480px] rounded-2xl p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-teal-600" />
                Branded QR Studio — {qrModalCampaign.name}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* QR Preview Box */}
              <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner relative group">
                <div
                  className="p-4 rounded-xl shadow-md inline-block"
                  style={{ backgroundColor: qrBgColor }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      `${typeof window !== "undefined" ? window.location.origin : "https://doctor.naturexpress.in"}/m/${qrModalCampaign.code}`
                    )}&color=${qrColor.replace("#", "")}&bgcolor=${qrBgColor.replace("#", "")}`}
                    alt="QR Preview"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xs font-bold text-slate-800 font-mono">/m/{qrModalCampaign.code}</p>
                    <p className="text-[10px] text-slate-500">Scan to visit Doctor Diary</p>
                  </div>
                </div>
              </div>

              {/* QR Color Pickers */}
              <div className="grid grid-cols-2 gap-3 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <Label className="text-xs font-bold text-slate-700">QR Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">{qrColor}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">{qrBgColor}</span>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => downloadBrandedQR(qrModalCampaign)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2"
                >
                  <Download className="w-4 h-4" />
                  PNG (Digital/Web)
                </Button>
                <Button
                  onClick={() => downloadSVGQR(qrModalCampaign)}
                  variant="outline"
                  className="flex-1 font-bold gap-2 text-slate-700 border-slate-300"
                >
                  <Download className="w-4 h-4 text-purple-600" />
                  SVG (Print Press)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── ATTRIBUTION DRILL-DOWN MODAL ────────────────────────────────────── */}
      {attributionModalCode && (
        <Dialog open={!!attributionModalCode} onOpenChange={() => setAttributionModalCode(null)}>
          <DialogContent className="w-[95vw] sm:max-w-[520px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Attributed Clinics for /m/{attributionModalCode}
              </DialogTitle>
            </DialogHeader>

            <div className="py-2">
              {loadingAttribution ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
                  <p className="text-xs text-slate-500 mt-2">Fetching attributed clinics...</p>
                </div>
              ) : attributedClinics.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No direct signups tracked yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When doctors scan /m/{attributionModalCode} and sign up, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {attributedClinics.map((clinic) => (
                    <div key={clinic.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{clinic.name}</p>
                        <p className="text-slate-500">{clinic.doctorName || "Dr. User"} • {clinic.phone}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(clinic.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
