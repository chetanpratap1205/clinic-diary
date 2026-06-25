export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="h-8 w-56 bg-slate-200 rounded-xl mb-2" />
          <div className="h-4 w-36 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Booking link banner skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-40 bg-slate-200 rounded" />
          <div className="h-3 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded-lg flex-shrink-0" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100" />
            <div className="h-8 w-12 bg-slate-200 rounded-lg" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Appointments card skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-50 py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-100 rounded-md" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
