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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { markOrderShipped } from "./actions";
import { toast } from "sonner";

export function OrdersClient({ orders }: { orders: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDownloadQR = async (url: string, filename: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1000,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR code.");
    }
  };

  const handleShipOrder = (orderId: string) => {
    setUpdatingId(orderId);
    startTransition(async () => {
      try {
        await markOrderShipped(orderId);
        toast.success("Order marked as shipped!");
      } catch (err) {
        toast.error("Failed to update status.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Order ID & Date</TableHead>
            <TableHead>Clinic</TableHead>
            <TableHead>Items & QR Assets</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((o) => (
              <TableRow key={o.order.id}>
                <TableCell>
                  <div className="font-mono text-xs text-slate-500 mb-1">
                    {o.order.id.split("-")[0]}...
                  </div>
                  <div className="text-sm font-medium">
                    {format(new Date(o.order.createdAt), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{o.clinicName}</div>
                  <div className="text-sm text-slate-500">{o.clinicPhone}</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate" title={o.order.shippingAddress}>
                    {o.order.shippingAddress || "No address provided"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {o.items.map((i: any) => (
                      <div key={i.item.id} className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded border">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {i.productName} <span className="text-slate-400">x{i.item.quantity}</span>
                          </p>
                        </div>
                        {i.item.generatedUrl && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleDownloadQR(i.item.generatedUrl, `QR_${o.clinicName.replace(/\s+/g, '_')}_${i.category}`)}
                          >
                            <Download className="w-3 h-3 mr-1" /> QR
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-700">
                    ₹{(o.order.amount / 100).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={o.order.status === "shipped" ? "default" : "secondary"}
                    className={
                      o.order.status === "shipped" 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                    }
                  >
                    {o.order.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {o.order.status !== "shipped" && (
                    <Button 
                      size="sm"
                      onClick={() => handleShipOrder(o.order.id)}
                      disabled={isPending && updatingId === o.order.id}
                    >
                      {isPending && updatingId === o.order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Truck className="w-4 h-4 mr-2" /> Mark Shipped</>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
