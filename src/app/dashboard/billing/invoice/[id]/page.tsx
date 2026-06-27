import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { paymentLogs, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { IndianRupee } from "lucide-react";
import { PrintButton } from "@/components/billing/PrintButton";

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const [invoiceRecord] = await db
    .select()
    .from(paymentLogs)
    .where(
      and(
        eq(paymentLogs.id, id),
        eq(paymentLogs.clinicId, authUser.clinicId)
      )
    )
    .limit(1);

  if (!invoiceRecord) {
    redirect("/dashboard/billing");
  }

  const [clinicRecord] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  if (!clinicRecord) {
    redirect("/dashboard/billing");
  }

  const amountINR = invoiceRecord.amountPaise / 100;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-slate-50/50 print:bg-white print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
        <PrintButton />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-12 print:border-none print:shadow-none print:p-0 relative overflow-hidden">
        {invoiceRecord.status.toLowerCase() === 'paid' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] z-0 print:opacity-[0.05]">
            <div className="text-[120px] md:text-[180px] font-black tracking-widest text-emerald-900 border-[12px] border-emerald-900 px-16 py-6 rounded-3xl uppercase">
              PAID
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-start border-b border-slate-100 pb-8 mb-8 relative z-10">
          <div>
            <div className="text-3xl font-black text-sky-600 tracking-tight mb-2">Doctor Diary</div>
            <div className="text-gray-500 text-sm">
              <p>123 Health Tech Park</p>
              <p>Bangalore, Karnataka 560001</p>
              <p>support@doctordiary.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-gray-300 uppercase tracking-widest mb-2">Invoice</h2>
            <div className="text-gray-900 font-medium">#{invoiceRecord.razorpayOrderId.replace('order_', '')}</div>
            <div className="text-gray-500 text-sm mt-1">Date: {format(new Date(invoiceRecord.paidAt), "MMM dd, yyyy")}</div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</h3>
            <div className="text-gray-900 font-medium text-lg">{clinicRecord.name}</div>
            <div className="text-gray-500 text-sm">
              <p>Dr. {clinicRecord.doctorName}</p>
              {clinicRecord.address && <p>{clinicRecord.address}</p>}
              <p>{clinicRecord.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status:</h3>
            <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-sm font-semibold capitalize">
              {invoiceRecord.status}
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Description</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 last:border-0">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">Doctor Diary {invoiceRecord.planName} Plan</div>
                  <div className="text-gray-500 text-sm mt-0.5">Subscription fee for clinic management software</div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900">
                  ₹{amountINR.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-1/2 md:w-1/3">
            <div className="flex justify-between py-2 border-b border-slate-100 text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>₹{amountINR.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold text-gray-900">
              <span>Total Paid</span>
              <span>₹{amountINR.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 text-center text-gray-500 text-sm">
          <p>Thank you for using Doctor Diary.</p>
          <p className="mt-1">If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>
      
      {/* CSS to hide sidebars and other navigation elements during printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          /* Target the specific container of the invoice to make it visible */
          .max-w-4xl.mx-auto > div:last-child,
          .max-w-4xl.mx-auto > div:last-child * {
            visibility: visible;
          }
          .max-w-4xl.mx-auto > div:last-child {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
