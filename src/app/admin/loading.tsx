import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-600" />
      <p className="text-sm font-medium">Loading data...</p>
    </div>
  );
}
