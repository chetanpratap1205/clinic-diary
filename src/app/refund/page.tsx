import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700">
            <RefreshCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
            <p className="text-slate-500 mt-1">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="prose prose-slate prose-teal max-w-none text-slate-600">
          <p>
            This Refund & Cancellation Policy ("Policy") outlines the terms regarding cancellations and refunds for the Doctor Diary software services provided by NatureXpress ("we", "us", "our"). By subscribing to our Services, you agree to this Policy.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Subscription Plans & Billing</h2>
          <p>
            Our Services are billed on a subscription basis (e.g., monthly, annually). You will be billed in advance on a recurring and periodic basis (each period is called a "Billing Cycle"). At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or NatureXpress cancels it.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Non-Refundable Subscriptions</h2>
          <p>
            <strong>All sales are final.</strong> Because Doctor Diary provides access to an immediate digital software platform with substantial infrastructure costs, <strong>we do not provide refunds or credits for any partial-month subscription periods or unused software.</strong>
          </p>
          <p>
            If you cancel your subscription, you will retain access to the Service until the end of your current paid Billing Cycle. No pro-rated refunds will be issued for the remainder of the billing period.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Cancellation Process</h2>
          <p>
            You may cancel your Subscription renewal either through your online account management page or by contacting NatureXpress customer support team. Cancellation requests must be made before the next billing date to avoid being charged for the subsequent Billing Cycle.
          </p>
          <p>
            Once a charge has been processed for a new Billing Cycle, it is strictly non-refundable, and your cancellation will apply to the following cycle.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Exceptions (At Our Sole Discretion)</h2>
          <p>
            Refunds are strictly not permitted except in the following limited circumstances, subject to our absolute and sole discretion:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Duplicate charges resulting from a technical billing error on our end.</li>
            <li>In the event that we terminate your service without cause prior to the end of your billing cycle (a pro-rated refund may be issued).</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Chargebacks and Payment Disputes</h2>
          <p>
            If you initiate a chargeback or payment dispute with your credit card company or bank, we reserve the right to immediately suspend or terminate your account. Fraudulent chargebacks may result in your account being permanently banned, and we reserve the right to dispute the chargeback and recover associated fees. Please contact our support team to resolve billing issues before initiating a dispute.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Changes to Pricing</h2>
          <p>
            NatureXpress, in its sole discretion and at any time, may modify the Subscription fees for the Subscriptions. Any Subscription fee change will become effective at the end of the then-current Billing Cycle. We will provide you with reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have questions about billing, cancellations, or this Policy, please contact our support team at billing@naturexpress.com.
          </p>
        </div>
      </div>
    </div>
  );
}
