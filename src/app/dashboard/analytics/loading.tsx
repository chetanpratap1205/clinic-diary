import { Loader2 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
          <div className="h-4 w-72 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="h-10 w-[180px] bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 h-[450px]">
           <div className="h-5 w-40 bg-muted animate-pulse rounded-md mb-2"></div>
           <div className="h-4 w-64 bg-muted animate-pulse rounded-md mb-8"></div>
           <div className="h-[350px] w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
           </div>
        </div>
        <div className="rounded-xl border bg-card p-6 h-[450px]">
           <div className="h-5 w-40 bg-muted animate-pulse rounded-md mb-2"></div>
           <div className="h-4 w-52 bg-muted animate-pulse rounded-md mb-8"></div>
           <div className="h-[300px] w-full flex items-center justify-center">
             <div className="h-48 w-48 bg-muted/50 animate-pulse rounded-full flex items-center justify-center">
               <div className="h-32 w-32 bg-card rounded-full"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
