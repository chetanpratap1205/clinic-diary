"use client";

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

type PaymentLog = {
  id: string;
  razorpayOrderId: string;
  planName: string;
  amountPaise: number;
  paidAt: Date;
  status: string;
};

interface BillingHistoryProps {
  paymentHistory: PaymentLog[];
}

export function BillingHistory({ paymentHistory }: BillingHistoryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Billing History
          </CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Plan</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No payment history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentHistory.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-gray-900">{invoice.razorpayOrderId}</TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(invoice.paidAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-gray-600">{invoice.planName}</TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        ₹{(invoice.amountPaise / 100).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
