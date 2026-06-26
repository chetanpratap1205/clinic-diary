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

export function BillingHistory() {
  // Mock invoice data
  const invoices = [
    {
      id: "INV-2026-004",
      date: "Apr 26, 2026",
      amount: "₹1299",
      plan: "3 Months Plan",
      status: "Paid",
    },
    {
      id: "INV-2026-003",
      date: "Jan 26, 2026",
      amount: "₹1299",
      plan: "3 Months Plan",
      status: "Paid",
    },
    {
      id: "INV-2025-002",
      date: "Oct 26, 2025",
      amount: "₹1299",
      plan: "3 Months Plan",
      status: "Paid",
    },
    {
      id: "INV-2025-001",
      date: "Sep 26, 2025",
      amount: "₹499",
      plan: "Monthly Plan",
      status: "Paid",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Billing History
          </CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">Invoice ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Plan</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-gray-900">{invoice.id}</TableCell>
                    <TableCell className="text-gray-600">{invoice.date}</TableCell>
                    <TableCell className="text-gray-600">{invoice.plan}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
