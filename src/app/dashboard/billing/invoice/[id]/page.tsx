import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { paymentLogs, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { PrintButton } from "@/components/billing/PrintButton";
import { formatDoctorName } from "@/lib/utils";

function numberToWords(num: number): string {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  let n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim();
}

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

  // --- GST Calculations ---
  const totalAmountINR = invoiceRecord.amountPaise / 100;
  // Total = Base * 1.18  => Base = Total / 1.18
  const taxableValue = totalAmountINR / 1.18;
  const totalGstAmount = totalAmountINR - taxableValue;

  const isIntraState = clinicRecord.state 
    ? (["uttar pradesh", "up", "u.p", "u.p."].some(s => clinicRecord.state!.toLowerCase().includes(s)))
    : false;

  const cgst = isIntraState ? totalGstAmount / 2 : 0;
  const sgst = isIntraState ? totalGstAmount / 2 : 0;
  const igst = !isIntraState ? totalGstAmount : 0;

  // Formatting helpers
  const formatINR = (amount: number) => 
    amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-slate-50/50 print:bg-white print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Tax Invoice</h1>
        <PrintButton />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-12 print:border-none print:shadow-none print:p-0 relative overflow-hidden text-sm">
        {invoiceRecord.status.toLowerCase() === 'paid' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] z-0 print:opacity-[0.05]">
            <div className="text-[100px] md:text-[140px] font-black tracking-widest text-emerald-900 border-[8px] border-emerald-900 px-12 py-4 rounded-3xl uppercase">
              PAID
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8 relative z-10">
          <div>
            <div className="text-2xl font-black text-sky-600 tracking-tight mb-1">
              Doctor Diary <span className="text-sm font-medium text-slate-500">by NatureXpress</span>
            </div>
            <div className="text-gray-600 space-y-0.5 mt-2 text-xs">
              <p className="font-bold text-gray-900 text-sm">PRATWI SOLUTIONS PRIVATE LIMITED</p>
              <p><span className="font-semibold">CIN:</span> U62011UP2023PTC187090</p>
              <p className="pt-1"><span className="font-semibold">Reg. Office:</span> Bhagirathi Enclave, Narora,</p>
              <p>Debai, Bulandshahr-203389, Uttar Pradesh</p>
              <p className="pt-1"><span className="font-semibold">Corp. Office:</span> 124, Heera bagh, Vijay nagar,</p>
              <p>Indore, MP 452010</p>
              <p className="pt-1"><span className="font-semibold">GSTIN:</span> 09AANCP9915B1Z4 &nbsp;|&nbsp; <span className="font-semibold">PAN:</span> AANCP9915B</p>
              <p><span className="font-semibold">Mobile:</span> +91 8077170715</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border border-slate-200 inline-block px-2 py-0.5 rounded">
              Original For Recipient
            </div>
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-2 mt-1">TAX INVOICE</h2>
            <div className="space-y-0.5 text-gray-600 mt-4 text-sm">
              <p><span className="font-semibold">Invoice No:</span> {invoiceRecord.invoiceNumber || "N/A"}</p>
              <p><span className="font-semibold">Order ID:</span> {invoiceRecord.razorpayOrderId || "N/A"}</p>
              <p><span className="font-semibold">Invoice Date:</span> {format(new Date(invoiceRecord.paidAt), "dd-MMM-yyyy")}</p>
              <p><span className="font-semibold">Place of Supply:</span> {clinicRecord.state || "Unregistered (B2C)"}</p>
              <p><span className="font-semibold">Reverse Charge:</span> N.A.</p>
            </div>
          </div>
        </div>

        {/* Billed To Section */}
        <div className="flex justify-between items-start mb-10 bg-slate-50 p-5 rounded-xl border border-slate-100">
          <div className="w-1/2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To / Customer Details:</h3>
            <div className="text-gray-900 font-bold text-lg mb-1">{clinicRecord.name}</div>
            <div className="text-gray-600 space-y-0.5 text-sm">
              <p>Attn: {formatDoctorName(clinicRecord.doctorName)}</p>
              {clinicRecord.billingAddress ? (
                <p>{clinicRecord.billingAddress}</p>
              ) : clinicRecord.address ? (
                <p>{clinicRecord.address}</p>
              ) : null}
              {clinicRecord.phone && <p>Phone: {clinicRecord.phone}</p>}
              {clinicRecord.state && <p>State: {clinicRecord.state}</p>}
              {clinicRecord.gstin && (
                <p className="pt-1">
                  <span className="font-semibold">GSTIN:</span> {clinicRecord.gstin}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Status:</h3>
            <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-sm font-bold capitalize shadow-sm">
              {invoiceRecord.status}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-4 font-bold text-sm w-12 text-center">#</th>
                <th className="py-3 px-4 font-bold text-sm">Description of Services</th>
                <th className="py-3 px-4 font-bold text-sm w-24 text-center">HSN/SAC</th>
                <th className="py-3 px-4 font-bold text-sm w-16 text-center">Qty</th>
                <th className="py-3 px-4 font-bold text-sm text-right w-32">Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-4 text-center text-slate-500">1</td>
                <td className="py-4 px-4">
                  <div className="font-bold text-gray-900">SaaS Subscription - {invoiceRecord.planName} Plan</div>
                  <div className="text-gray-500 text-xs mt-1">Software as a Service (SaaS) for Clinic Management</div>
                </td>
                <td className="py-4 px-4 text-slate-700 text-center">998314</td>
                <td className="py-4 px-4 text-slate-700 text-center">1</td>
                <td className="py-4 px-4 text-right font-medium text-gray-900">
                  ₹{formatINR(taxableValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-full md:w-1/2">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 px-4">
                <span>Total Taxable Value</span>
                <span className="font-medium">₹{formatINR(taxableValue)}</span>
              </div>
              
              {isIntraState ? (
                <>
                  <div className="flex justify-between text-gray-600 px-4">
                    <span>CGST @ 9%</span>
                    <span>₹{formatINR(cgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 px-4">
                    <span>SGST @ 9%</span>
                    <span>₹{formatINR(sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-600 px-4">
                  <span>IGST @ 18%</span>
                  <span>₹{formatINR(igst)}</span>
                </div>
              )}

              <div className="h-px bg-slate-200 my-2"></div>
              
              <div className="flex justify-between items-center text-xl font-black text-gray-900 px-4 bg-slate-50 py-3 rounded-lg border border-slate-100">
                <span>Invoice Total</span>
                <span>₹{formatINR(totalAmountINR)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="mb-12 border-t border-b border-slate-100 py-4">
          <p className="text-xs text-gray-500 font-medium">Amount in Words:</p>
          <p className="text-sm font-bold text-gray-900 capitalize">
            {/* Note: In a real app we'd use a library like 'number-to-words', keeping it simple for now or you can add a small util */}
            Indian Rupees {numberToWords(totalAmountINR)} Only
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-800 pt-8 mt-12 grid grid-cols-2 gap-8 text-gray-600 text-xs">
          <div>
            <h4 className="font-bold text-gray-900 mb-2 uppercase text-[10px] tracking-wider">Terms & Conditions</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>All amounts are in Indian Rupees (INR).</li>
              <li>Subscription fees are non-refundable.</li>
              <li>Please contact support@doctordiary.com for any billing discrepancies.</li>
            </ul>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="mb-8">
              <p className="font-bold text-gray-900 text-sm">For PRATWI SOLUTIONS PRIVATE LIMITED</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Chetan Pratap Singh</p>
              <p className="text-[11px] text-gray-500">Authorised Signatory</p>
              <p className="text-[10px] text-gray-400 mt-2 italic">This is a computer-generated invoice and does not require a physical signature.</p>
            </div>
          </div>
        </div>
      </div>
      
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
