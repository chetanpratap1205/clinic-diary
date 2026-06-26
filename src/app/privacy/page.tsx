import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-500 mt-1">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="prose prose-slate prose-teal max-w-none text-slate-600">
          <p>
            This Privacy Policy describes how NatureXpress ("Company", "we", "us", or "our"), the creator of Doctor Diary, collects, uses, and shares your personal information when you use our website, application, and software services (collectively, the "Services"). By using our Services, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            <strong>A. Information provided by Clinics/Practitioners:</strong> When you register for an account, we collect your name, clinic name, email address, phone number, billing information, and professional credentials.
          </p>
          <p>
            <strong>B. Information provided by Patients:</strong> When patients book appointments through the Services, we collect their name, phone number, appointment details, and any notes they provide. <strong>Important Notice to Clinics:</strong> Under the Digital Personal Data Protection Act, 2023 (DPDP Act) of India, you (the clinic) act as the Data Fiduciary for your patients' data. NatureXpress acts solely as a Data Processor on your behalf. It is the clinic's strict responsibility to obtain necessary consent and ensure that any collection of patient data complies with the DPDP Act and other applicable healthcare privacy regulations.
          </p>
          <p>
            <strong>C. Automatically Collected Information:</strong> We collect certain data automatically, such as IP addresses, browser types, device information, and usage patterns (e.g., pages visited, clicks) to improve our Services.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the collected information for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To provide, maintain, and improve our Services.</li>
            <li>To process transactions and manage your subscription.</li>
            <li>To send automated appointment reminders via third-party services (e.g., WhatsApp).</li>
            <li>To communicate with you regarding updates, security alerts, and support messages.</li>
            <li>To detect, prevent, and address technical issues or fraudulent activities.</li>
            <li>To aggregate anonymized data for analytical and business purposes.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Sharing and Third Parties</h2>
          <p>
            We do not sell your personal data. We may share information with third-party service providers that assist us in operating our business (e.g., hosting providers like Supabase/Vercel, communication APIs like Twilio/WhatsApp, and payment processors). These third parties are bound by confidentiality obligations.
          </p>
          <p>
            We may also disclose information if required to do so by law or in the good faith belief that such action is necessary to comply with legal obligations, protect our rights or property, or prevent fraud.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. <strong>We cannot and do not guarantee absolute security.</strong> By using our Services, you acknowledge that you provide data at your own risk. NatureXpress shall not be held liable for any data breaches, unauthorized access, or loss of data to the maximum extent permitted by applicable law.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Disclaimer Regarding Medical Information</h2>
          <p>
            Doctor Diary is a scheduling and practice management tool, not a medical records system. We strongly advise against storing sensitive health information (PHI/ePHI) within our platform unless strictly necessary for booking purposes. Clinics assume all liability for the type of data they request from patients through our platform.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Your Rights & DPDP Act Compliance</h2>
          <p>
            In accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), Data Principals (users and patients) have the right to access, correct, update, or erase their personal data. If you are a Clinic, you can manage this directly in your account. If you are a Patient, you must contact your respective Clinic (the Data Fiduciary) to exercise these rights, and we will assist the Clinic in fulfilling your request.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Changes to This Privacy Policy</h2>
          <p>
            We reserve the right to modify this Privacy Policy at any time, at our sole discretion. Any changes will be effective immediately upon posting on this page. Your continued use of the Services following any updates constitutes your acceptance of the revised Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@doctor.naturexpress.in.
          </p>
        </div>
      </div>
    </div>
  );
}
