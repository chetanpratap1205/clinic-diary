import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-slate-500 mt-1">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="prose prose-slate prose-teal max-w-none text-slate-600">
          <p>
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Doctor Diary website, software, and application (the "Service") operated by NatureXpress ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Use of Service & Account Responsibilities</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. B2B Service & Compliance</h2>
          <p>
            The Service is a Business-to-Business (B2B) software solution intended for clinics, doctors, and medical practitioners to manage scheduling. You, the customer, represent that you are acting in a professional/business capacity.
          </p>
          <p>
            <strong>Medical Compliance:</strong> NatureXpress merely provides scheduling software. We do not provide medical advice, nor are we a medical records management system. It is your sole responsibility to ensure that your use of the Service, including any patient data you collect, complies with all applicable local, state, and national healthcare laws (such as HIPAA in the US, GDPR in Europe, etc.).
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of NatureXpress and its licensors. The Service is protected by copyright, trademark, and other laws of both the country you reside in and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of NatureXpress.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. "As Is" and "As Available" Disclaimer</h2>
          <p>
            YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT OR COURSE OF PERFORMANCE.
          </p>
          <p>
            NatureXpress its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL NATUREXPRESS, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
          </p>
          <p>
            In no event shall our total aggregate liability for all claims arising out of or related to these Terms exceed the total amount paid by you to NatureXpress for the Service in the twelve (12) months immediately preceding the event giving rise to the claim.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Indemnification</h2>
          <p>
            You agree to defend, indemnify and hold harmless NatureXpress and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms; or c) any claims brought by your patients related to data privacy, missed appointments, or medical malpractice, except to the extent such claims arise directly from NatureXpress's gross negligence or willful misconduct.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue using the Service and cancel your subscription through the billing portal. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of New Delhi, India, without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@doctor.naturexpress.in.
          </p>
        </div>
      </div>
    </div>
  );
}
