import { db } from "@/db";
import { unclaimedClinics, clinics } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import Link from "next/link";
import { MapPin, Search, Stethoscope, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Find a Doctor Near You | NatureXpress",
  description: "Browse thousands of top-rated doctors, clinics, and specialists across India. Book appointments instantly.",
};

export default async function DirectoryIndexPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";

  // Dynamic search condition
  let condition = undefined;
  if (search) {
    condition = or(
      ilike(unclaimedClinics.city, `%${search}%`),
      ilike(unclaimedClinics.specialty, `%${search}%`),
      ilike(unclaimedClinics.doctorName, `%${search}%`)
    );
  }

  // Fetch only unclaimed for the directory view, or active ones if we merge them.
  // For this SEO directory, we focus on unclaimed profiles.
  const docs = await db
    .select()
    .from(unclaimedClinics)
    .where(condition)
    .limit(50); // limit for now

  // Extract unique cities and specialties for quick filters
  const cities = Array.from(new Set(docs.map(d => d.city))).slice(0, 8);
  const specialties = Array.from(new Set(docs.map(d => d.specialty))).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-teal-700 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Find Top Doctors & Specialists
          </h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Browse our comprehensive directory of verified healthcare professionals and book your consultation online.
          </p>
          
          <form className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                name="search"
                defaultValue={search}
                placeholder="Search doctors, specialties, or cities..." 
                className="w-full pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-xl">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Quick Filters */}
        {!search && (
          <div className="mb-12 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                Popular Cities
              </h2>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => (
                  <Link key={c} href={`/directory?search=${c}`}>
                    <Badge variant="secondary" className="px-4 py-2 text-sm bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 cursor-pointer">
                      {c}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-teal-600" />
                Top Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map(s => (
                  <Link key={s} href={`/directory?search=${s}`}>
                    <Badge variant="secondary" className="px-4 py-2 text-sm bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 cursor-pointer">
                      {s}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {search ? `Search Results for "${search}"` : "Featured Doctors"}
            <span className="text-slate-500 text-base font-normal ml-2">({docs.length} found)</span>
          </h2>
          
          {docs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No doctors found</h3>
              <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map(doc => (
                <Link 
                  key={doc.id} 
                  href={`/directory/${doc.city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${doc.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-teal-200 transition-all group flex flex-col h-full"
                >
                  <div className="flex-1">
                    <Badge className="bg-teal-50 text-teal-700 mb-3 hover:bg-teal-50">{doc.specialty}</Badge>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {doc.doctorName}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">{doc.clinicName}</p>
                    <div className="flex items-start gap-2 mt-4 text-sm text-slate-500">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                      <span>{doc.address}, {doc.city}</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-600 font-medium text-sm">
                    View Profile
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
