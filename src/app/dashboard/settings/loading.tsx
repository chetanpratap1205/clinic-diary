export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-24 bg-slate-200 rounded-xl" />
        <div className="h-4 w-48 bg-slate-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">
        {/* Left: Form skeleton */}
        <div className="xl:col-span-3 space-y-5">
          {/* Brand Identity card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <div className="h-6 w-36 bg-slate-200 rounded" />
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-11 bg-slate-100 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-11 bg-slate-100 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                  <div className="h-11 bg-slate-100 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-11 bg-slate-100 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              {/* Color picker skeleton */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="flex gap-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-200" />
                  ))}
                </div>
              </div>
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right: Preview skeleton */}
        <div className="xl:col-span-2">
          <div className="h-5 w-24 bg-slate-200 rounded mb-4" />
          <div className="bg-white rounded-[2rem] border-8 border-slate-100 shadow-xl overflow-hidden" style={{ height: 520 }}>
            <div className="h-1.5 bg-slate-200 w-full" />
            <div className="p-5 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
