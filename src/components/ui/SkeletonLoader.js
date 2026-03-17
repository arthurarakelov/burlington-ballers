import React from 'react';

const SkeletonLoader = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div
    className={`${width} ${height} rounded-lg ${className}`}
    style={{
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }}
  />
);

const GameCardSkeleton = () => (
  <div className="bg-white/[0.05] rounded-2xl p-4 sm:p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="w-36" height="h-5" />
        <SkeletonLoader width="w-28" height="h-4" />
        <SkeletonLoader width="w-40" height="h-4" />
      </div>
      <div className="space-y-2">
        <SkeletonLoader width="w-14" height="h-7" className="rounded-lg" />
        <SkeletonLoader width="w-12" height="h-4" />
      </div>
    </div>
  </div>
);

const GameDetailsSkeleton = () => (
  <div className="space-y-5">
    <div className="text-center pt-2">
      <SkeletonLoader width="w-48" height="h-7" className="mx-auto mb-4" />
      <div className="space-y-2">
        <SkeletonLoader width="w-40" height="h-4" className="mx-auto" />
        <SkeletonLoader width="w-44" height="h-4" className="mx-auto" />
        <SkeletonLoader width="w-32" height="h-4" className="mx-auto" />
      </div>
    </div>
    <div className="bg-white/[0.04] rounded-2xl p-4 space-y-3">
      <SkeletonLoader width="w-24" height="h-4" />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <SkeletonLoader width="w-8" height="h-8" className="rounded-full" />
            <SkeletonLoader width="w-24" height="h-4" />
          </div>
          <SkeletonLoader width="w-12" height="h-4" />
        </div>
      ))}
    </div>
    <div className="bg-white/[0.05] rounded-2xl p-5">
      <SkeletonLoader width="w-full" height="h-11" className="rounded-xl" />
    </div>
  </div>
);

export { SkeletonLoader, GameCardSkeleton, GameDetailsSkeleton };
