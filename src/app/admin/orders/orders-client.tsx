"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  Download,
  Loader2,
  Search,
  Plus,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  Check,
  MapPin,
  ExternalLink,
  Gift,
  ShieldCheck,
  Trash2,
  Edit,
  Sparkles,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { formatDoctorName } from "@/lib/utils";
import {
  markOrderShipped,
  updateOrderStatus,
  updateShippingDetails,
  createAdminOrder,
  deleteOrder,
} from "./actions";

const COURIER_CARRIERS = [
  { value: "bluedart", label: "BlueDart Express" },
  { value: "delhivery", label: "Delhivery Logistics" },
  { value: "dtdc", label: "DTDC Courier" },
  { value: "indiapost", label: "India Post SpeedPost" },
  { value: "porter", label: "Porter Local" },
  { value: "other", label: "Other Courier" },
];

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", bg: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "processing", label: "Processing / Printing", bg: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "shipped", label: "Shipped / In Transit", bg: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "delivered", label: "Delivered", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", bg: "bg-rose-100 text-rose-800 border-rose-200" },
];

interface OrdersClientProps {
  orders: any[];
  clinics?: any[];
  products?: any[];
}

export function OrdersClient({ orders, clinics = [], products = [] }: OrdersClientProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [printLabelOrder, setPrintLabelOrder] = useState<any | null>(null);
  const [editShippingOrder, setEditShippingOrder] = useState<any | null>(null);

  // Logistics state for editing order shipping
  const [logisticsForm, setLogisticsForm] = useState({
    courierName: "bluedart",
    trackingNumber: "",
    trackingUrl: "",
    shippingAddress: "",
    notes: "",
  });

  // Form state for Create Admin Order
  const [newOrderData, setNewOrderData] = useState({
    clinicId: "",
    planOption: "free_trial", // free_trial, quarterly_2999, yearly_9999, custom
    customAmount: 0,
    shippingAddress: "",
    courierName: "bluedart",
    trackingNumber: "",
    selectedProducts: [] as { productId: string; quantity: number }[],
    notes: "",
  });

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clinicDoctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clinicPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.order.shippingAddress && o.order.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || o.order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Handle QR Single Download
  const handleDownloadQR = async (url: string, filename: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1000,
        margin: 2,
        color: { dark: "#00B7A8", light: "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR Asset downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR code.");
    }
  };

  // Handle Status Change
  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      }
    });
  };

  // Save Shipping Logistics Details
  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShippingOrder) return;

    startTransition(async () => {
      const res = await updateShippingDetails(editShippingOrder.order.id, logisticsForm);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Logistics details saved!");
        setEditShippingOrder(null);
      }
    });
  };

  // Submit New Order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderData.clinicId) {
      toast.error("Please select a clinic.");
      return;
    }

    let finalAmount = 0;
    let paymentStatus = "paid";
    let planType = newOrderData.planOption;

    if (newOrderData.planOption === "free_trial") {
      finalAmount = 0;
      paymentStatus = "free_trial";
      planType = "free_trial";
    } else if (newOrderData.planOption === "quarterly_2999") {
      finalAmount = 2999;
      paymentStatus = "paid";
      planType = "quarterly_2999";
    } else if (newOrderData.planOption === "yearly_9999") {
      finalAmount = 9999;
      paymentStatus = "paid";
      planType = "yearly_9999";
    } else {
      finalAmount = newOrderData.customAmount || 0;
      paymentStatus = finalAmount === 0 ? "free_trial" : "paid";
    }

    startTransition(async () => {
      const res = await createAdminOrder({
        clinicId: newOrderData.clinicId,
        amount: finalAmount,
        paymentStatus,
        planType,
        shippingAddress: newOrderData.shippingAddress,
        courierName: newOrderData.courierName,
        trackingNumber: newOrderData.trackingNumber,
        notes: newOrderData.notes,
        items: newOrderData.selectedProducts,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Fulfillment order created & dispatched!");
        setCreateOpen(false);
      }
    });
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    startTransition(async () => {
      const res = await deleteOrder(orderId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Order deleted.");
      }
    });
  };

  // Copy Address
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Shipping address copied to clipboard!");
  };

  // Helper: Format Rupee Amount & Plan Badge
  const renderAmountAndPlan = (amount: number, planType?: string, paymentStatus?: string) => {
    if (amount === 0 || paymentStatus === "free_trial" || planType === "free_trial") {
      return (
        <div>
          <span className="font-extrabold text-emerald-700 text-sm flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            ₹0 (Free Trial)
          </span>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 block w-fit mt-0.5">
            14-Day Complimentary
          </span>
        </div>
      );
    }

    if (amount === 2999 || planType === "quarterly_2999") {
      return (
        <div>
          <span className="font-extrabold text-slate-900 text-sm">₹1,499</span>
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 block w-fit mt-0.5">
            Quarterly Subscription
          </span>
        </div>
      );
    }

    if (amount === 9999 || planType === "yearly_9999") {
      return (
        <div>
          <span className="font-extrabold text-slate-900 text-sm">₹4,999</span>
          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 block w-fit mt-0.5">
            Annual Plan (Best Value)
          </span>
        </div>
      );
    }

    // Default formatting
    const formattedRupees = (amount > 10000 && amount % 100 === 0) ? (amount / 100) : amount;
    return (
      <div>
        <span className="font-extrabold text-slate-900 text-sm">
          ₹{formattedRupees.toLocaleString("en-IN")}
        </span>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded block w-fit mt-0.5">
          {paymentStatus?.toUpperCase() || "PAID"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            placeholder="Search clinic, doctor, order ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-100 p-1">
              <TabsTrigger value="all" className="text-xs">All Orders</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
              <TabsTrigger value="processing" className="text-xs">Processing</TabsTrigger>
              <TabsTrigger value="shipped" className="text-xs">Shipped</TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* New Order Button */}
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Dispatch New Order
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Order ID & Date</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Clinic & Shipping Address</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Items & QR Assets</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Plan & Amount</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700">Fulfillment Status</TableHead>
                <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No fulfillment orders found</p>
                      <p className="text-xs text-slate-400">Dispatch a new order or adjust your search filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o) => {
                  const statusMeta = ORDER_STATUSES.find((s) => s.value === o.order.status) || ORDER_STATUSES[0];
                  const address = o.order.shippingAddress || o.clinicAddress || "No address provided";

                  return (
                    <TableRow key={o.order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID & Date */}
                      <TableCell className="min-w-[140px]">
                        <span className="font-mono text-xs text-slate-500 font-semibold block">
                          #{o.order.id.split("-")[0].toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-700 font-medium mt-0.5 block">
                          {format(new Date(o.order.createdAt), "MMM d, yyyy")}
                        </span>
                      </TableCell>

                      {/* Clinic & Address */}
                      <TableCell className="min-w-[220px]">
                        <p className="font-bold text-slate-900 text-sm leading-snug">{o.clinicName}</p>
                        <p className="text-xs text-slate-600">{o.clinicDoctorName ? `${formatDoctorName(o.clinicDoctorName)}` : o.clinicPhone}</p>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]" title={address}>{address}</span>
                          <button
                            onClick={() => copyAddress(address)}
                            className="p-0.5 hover:text-slate-900 text-slate-400 ml-auto"
                            title="Copy address"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>

                      {/* Items */}
                      <TableCell className="min-w-[220px]">
                        <div className="space-y-1.5">
                          {o.items.map((i: any) => (
                            <div key={i.item.id} className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-200/80 text-xs">
                              <span className="font-semibold text-slate-800">
                                {i.productName} <span className="text-slate-400">x{i.item.quantity}</span>
                              </span>
                              {i.item.generatedUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px] text-teal-700 hover:bg-teal-50 gap-1 font-bold"
                                  onClick={() => handleDownloadQR(i.item.generatedUrl, `QR_${o.clinicName.replace(/\s+/g, '_')}_${i.category}`)}
                                >
                                  <Download className="w-3 h-3" /> QR
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* Amount & Plan */}
                      <TableCell className="min-w-[140px]">
                        {renderAmountAndPlan(o.order.amount, o.order.planType, o.order.paymentStatus)}
                      </TableCell>

                      {/* Status & Courier */}
                      <TableCell className="min-w-[160px]">
                        <Select
                          value={o.order.status}
                          onValueChange={(val) => handleStatusChange(o.order.id, val)}
                        >
                          <SelectTrigger className={`h-8 text-xs font-bold rounded-lg border ${statusMeta.bg}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="text-xs font-medium">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {o.order.courierName && (
                          <div className="mt-1.5 text-[11px] text-slate-600 font-medium flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-500" />
                            <span className="capitalize">{o.order.courierName}</span>
                            {o.order.trackingNumber && (
                              <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">#{o.order.trackingNumber}</span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrintLabelOrder(o)}
                            className="h-8 text-xs gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50"
                            title="Print Package Label & Manifest"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            Label
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditShippingOrder(o);
                              setLogisticsForm({
                                courierName: o.order.courierName || "bluedart",
                                trackingNumber: o.order.trackingNumber || "",
                                trackingUrl: o.order.trackingUrl || "",
                                shippingAddress: o.order.shippingAddress || o.clinicAddress || "",
                                notes: o.order.notes || "",
                              });
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            title="Edit Logistics Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(o.order.id)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Order"
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

      {/* ─── CREATE / DISPATCH ORDER MODAL ────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Dispatch New Fulfillment Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-4 mt-2">
            {/* Select Clinic */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Doctor Clinic</Label>
              <Select
                value={newOrderData.clinicId}
                onValueChange={(val) => {
                  const selectedClinic = clinics.find((c) => c.id === val);
                  setNewOrderData({
                    ...newOrderData,
                    clinicId: val,
                    shippingAddress: selectedClinic?.address || "",
                  });
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Choose a clinic..." />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.doctorName ? `(${formatDoctorName(c.doctorName)})` : ""} — {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan & Pricing Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Plan Purchased / Pricing Option</Label>
              <Select
                value={newOrderData.planOption}
                onValueChange={(val) => setNewOrderData({ ...newOrderData, planOption: val })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_trial">🎁 14-Day Free Trial (₹0 Complimentary)</SelectItem>
                  <SelectItem value="quarterly_2999">💳 Quarterly Subscription (₹1,499 / month)</SelectItem>
                  <SelectItem value="yearly_9999">👑 Annual Subscription (₹4,999 / year)</SelectItem>
                  <SelectItem value="custom">💵 Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newOrderData.planOption === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Custom Amount (Rupees)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2499"
                  value={newOrderData.customAmount || ""}
                  onChange={(e) => setNewOrderData({ ...newOrderData, customAmount: Number(e.target.value) })}
                  className="text-sm"
                />
              </div>
            )}

            {/* Shipping Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Shipping Delivery Address</Label>
              <Input
                placeholder="Full delivery address with PIN code..."
                value={newOrderData.shippingAddress}
                onChange={(e) => setNewOrderData({ ...newOrderData, shippingAddress: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Logistics Info */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <Label className="text-xs font-bold text-slate-700">Courier Carrier</Label>
                <Select
                  value={newOrderData.courierName}
                  onValueChange={(val) => setNewOrderData({ ...newOrderData, courierName: val })}
                >
                  <SelectTrigger className="text-xs bg-white h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURIER_CARRIERS.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700">Tracking AWB Number</Label>
                <Input
                  placeholder="e.g. BD-982142"
                  value={newOrderData.trackingNumber}
                  onChange={(e) => setNewOrderData({ ...newOrderData, trackingNumber: e.target.value })}
                  className="text-xs h-8 bg-white"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Dispatch Order
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── PRINTABLE PACKING SLIP & SHIPPING LABEL MODAL ───────────────────────── */}
      {printLabelOrder && (
        <Dialog open={!!printLabelOrder} onOpenChange={() => setPrintLabelOrder(null)}>
          <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-2xl p-6">
            <div className="space-y-4 border-2 border-slate-900 p-6 rounded-xl bg-white text-slate-900 font-sans relative">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-black text-xl tracking-tight uppercase">Doctor Diary</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fulfillment Logistics Label</p>
                </div>
                <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 border border-slate-300 rounded">
                  #{printLabelOrder.order.id.split("-")[0].toUpperCase()}
                </span>
              </div>

              {/* Ship To Address Box */}
              <div className="border-b-2 border-slate-900 pb-3">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">DELIVER TO:</p>
                <p className="font-black text-base mt-1">{printLabelOrder.clinicName}</p>
                <p className="text-xs font-bold text-slate-700">{printLabelOrder.clinicDoctorName ? `${formatDoctorName(printLabelOrder.clinicDoctorName)}` : ""}</p>
                <p className="text-xs text-slate-800 mt-1 font-medium leading-relaxed">
                  {printLabelOrder.order.shippingAddress || printLabelOrder.clinicAddress || "No Address Provided"}
                </p>
                <p className="text-xs font-bold text-slate-900 mt-1">Ph: {printLabelOrder.clinicPhone}</p>
              </div>

              {/* Manifest Items */}
              <div className="border-b-2 border-slate-900 pb-3">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-1">PACKAGE CONTENTS:</p>
                <div className="space-y-1 text-xs font-semibold">
                  {printLabelOrder.items.map((i: any) => (
                    <div key={i.item.id} className="flex justify-between">
                      <span>• {i.productName}</span>
                      <span>x{i.item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrier Info */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">COURIER:</span>
                  <span className="font-bold uppercase">{printLabelOrder.order.courierName || "Standard Shipping"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">AWB / TRACKING:</span>
                  <span className="font-mono font-bold">{printLabelOrder.order.trackingNumber || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => window.print()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2"
              >
                <Printer className="w-4 h-4" /> Print Shipping Label
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── EDIT LOGISTICS DETAILS MODAL ─────────────────────────────────────── */}
      {editShippingOrder && (
        <Dialog open={!!editShippingOrder} onOpenChange={() => setEditShippingOrder(null)}>
          <DialogContent className="w-[95vw] sm:max-w-[480px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Edit Shipping Details — #{editShippingOrder.order.id.split("-")[0].toUpperCase()}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveShipping} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Courier Carrier</Label>
                <Select
                  value={logisticsForm.courierName}
                  onValueChange={(val) => setLogisticsForm({ ...logisticsForm, courierName: val })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURIER_CARRIERS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">AWB Tracking Number</Label>
                <Input
                  placeholder="e.g. BD-982142"
                  value={logisticsForm.trackingNumber}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, trackingNumber: e.target.value })}
                  className="text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tracking URL</Label>
                <Input
                  type="url"
                  placeholder="https://track.bluedart.com/..."
                  value={logisticsForm.trackingUrl}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, trackingUrl: e.target.value })}
                  className="text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Delivery Address</Label>
                <Input
                  value={logisticsForm.shippingAddress}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, shippingAddress: e.target.value })}
                  className="text-sm"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Shipping Details
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
