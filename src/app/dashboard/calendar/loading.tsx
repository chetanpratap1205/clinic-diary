export default function CalendarLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="h-8 w-36 bg-slate-200 rounded-xl" />
        <div className="h-4 w-52 bg-slate-100 rounded-lg" />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Calendar skeleton */}
        <div className="w-full lg:col-span-5 xl:col-span-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-6 bg-slate-200 rounded" />
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-5 w-6 bg-slate-200 rounded" />
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded mx-auto w-6" />
              ))}
            </div>
            {/* Calendar grid */}
            {[...Array(5)].map((_, row) => (
              <div key={row} className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, col) => (
                  <div
                    key={col}
                    className="h-9 bg-slate-100 rounded-lg mx-auto w-9"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule skeleton */}
        <div className="w-full lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-6 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-40 bg-slate-100 rounded" />
            </div>
            <div className="h-7 w-20 bg-slate-100 rounded-full" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
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
