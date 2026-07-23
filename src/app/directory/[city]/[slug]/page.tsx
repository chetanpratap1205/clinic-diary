import { db } from "@/db";
import { unclaimedClinics, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { MapPin, Building2, Phone, Star, ShieldCheck, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const [doc] = await db
    .select()
    .from(unclaimedClinics)
    .where(eq(unclaimedClinics.slug, params.slug))
    .limit(1);

  if (!doc) return { title: "Not Found" };

  return {
    title: `${doc.doctorName} - ${doc.specialty} in ${doc.city} | Book Appointment`,
    description: `Book an appointment with ${doc.doctorName} at ${doc.clinicName} in ${doc.city}. ${doc.specialty} specialist.`,
  };
}

export default async function DoctorProfilePage(props: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const params = await props.params;
  
  // 1. Find the unclaimed clinic
  const [doc] = await db
    .select()
    .from(unclaimedClinics)
    .where(eq(unclaimedClinics.slug, params.slug))
    .limit(1);

  if (!doc) return notFound();

  // 2. If it is already claimed, redirect to the actual booking page!
  if (doc.isClaimed && doc.claimedClinicId) {
    // We need to fetch the active clinic's slug to redirect properly
    const [activeClinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, doc.claimedClinicId))
      .limit(1);
    if (activeClinic) {
      redirect(`/book/${activeClinic.slug}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner */}
      <div className="bg-teal-700 h-32 md:h-48 w-full" />
      
      <main className="max-w-4xl mx-auto px-4 -mt-16 md:-mt-24">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar placeholder */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
                <User className="w-12 h-12 md:w-16 md:h-16 text-slate-300" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    Unclaimed Profile
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  {doc.doctorName}
                </h1>
                <p className="text-lg text-teal-700 font-medium">
                  {doc.specialty}
                </p>
                <div className="flex items-center gap-4 text-slate-500 text-sm mt-2">
                  <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {doc.clinicName}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {doc.city}, {doc.state}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About the Clinic</h2>
                  <p className="text-slate-600 leading-relaxed">
                    This is a public directory listing for {doc.doctorName}, practicing at {doc.clinicName} in {doc.city}. 
                    Currently, this clinic is not accepting online appointments through our platform.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Clinic Address</h2>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-slate-900 font-medium">{doc.clinicName}</p>
                      <p className="text-slate-600 text-sm mt-1">{doc.address}</p>
                      <p className="text-slate-600 text-sm">{doc.city}, {doc.state}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="md:col-span-1">
                {/* The "Claim Clinic" CTA Box (The Growth Hack) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg sticky top-6">
                  <ShieldCheck className="w-10 h-10 text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Are you {doc.doctorName}?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    Claim this profile to update your information, manage reviews, and start accepting online appointments instantly.
                  </p>
                  <Link href={`/onboarding?claim=${doc.id}`} className="block">
                    <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base h-12">
                      Claim Clinic Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Verification required. 100% free setup.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
