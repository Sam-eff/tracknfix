function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ backgroundColor: "color-mix(in srgb, var(--color-border) 72%, transparent)" }}
    />
  );
}

export function PublicPageFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="w-full max-w-md space-y-5">
        <SkeletonBlock className="h-10 w-40" />
        <SkeletonBlock className="h-6 w-64" />
        <div
          className="rounded-3xl p-6 space-y-4"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AppShellFallback() {
  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <aside
        className="hidden lg:flex lg:flex-col w-64 shrink-0 px-4 py-6 gap-4"
        style={{ backgroundColor: "var(--color-sidebar)" }}
      >
        <div className="flex items-center gap-3 px-2">
          <SkeletonBlock className="h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2 mt-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="mt-auto space-y-3">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-16 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <SkeletonBlock className="h-9 w-9 rounded-lg" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-9 w-9 rounded-lg" />
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-6">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="space-y-3">
        <SkeletonBlock className="h-10 w-52" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      <div
        className="rounded-3xl p-6 space-y-4"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-12 w-2/3" />
      </div>

      <div
        className="rounded-3xl p-6 space-y-3"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-72 max-w-full" />
          <SkeletonBlock className="h-5 w-64 max-w-full" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl p-6 space-y-5"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 8px 30px -12px rgba(0,0,0,0.08)",
            }}
          >
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div
        className="rounded-3xl p-6 md:p-8 space-y-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-56" />
            <SkeletonBlock className="h-4 w-40" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
        <SkeletonBlock className="h-[320px] w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl p-8 space-y-5"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <SkeletonBlock className="h-12 w-12 rounded-2xl" />
            <SkeletonBlock className="h-8 w-44" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-28 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
