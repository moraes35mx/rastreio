'use client';

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 rounded ${className}`}
    />
  );
}

export function TrackingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-3">
        <SkeletonLine className="h-8 w-64" />
        <SkeletonLine className="h-6 w-32" />
      </div>

      {/* Progress bar */}
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <SkeletonLine className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-4 space-y-3">
            <SkeletonLine className="h-4 w-20" />
            <SkeletonLine className="h-5 w-32" />
            <SkeletonLine className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 bg-zinc-900 rounded-lg p-4 space-y-2">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-3 w-full" />
              <SkeletonLine className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
