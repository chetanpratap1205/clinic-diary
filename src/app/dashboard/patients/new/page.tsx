import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPatientForm } from "@/components/dashboard/patients/new-patient-form";

export default async function NewPatientPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-safe bottom-nav-spacing lg:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Add New Patient
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Enter patient details to add them to your directory.
        </p>
      </div>

      <NewPatientForm />
    </div>
  );
}
