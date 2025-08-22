import React from 'react';

const SkeletonLoader = ({ className = '', width = 'w-full', height = 'h-4' }) => {
  return (
    <div 
      className={`${width} ${height} bg-gray-800 rounded animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  );
};

const GameCardSkeleton = () => {
  return (
    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader width="w-32" height="h-6" />
        <SkeletonLoader width="w-16" height="h-4" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonLoader width="w-4" height="h-4" className="rounded-full" />
          <SkeletonLoader width="w-24" height="h-4" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonLoader width="w-4" height="h-4" className="rounded-full" />
          <SkeletonLoader width="w-40" height="h-4" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonLoader width="w-4" height="h-4" className="rounded-full" />
          <SkeletonLoader width="w-28" height="h-4" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-800">
        <SkeletonLoader width="w-20" height="h-4" className="mb-3" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonLoader width="w-6" height="h-6" className="rounded-full" />
              <SkeletonLoader width="w-20" height="h-4" />
            </div>
            <SkeletonLoader width="w-12" height="h-4" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonLoader width="w-6" height="h-6" className="rounded-full" />
              <SkeletonLoader width="w-16" height="h-4" />
            </div>
            <SkeletonLoader width="w-12" height="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

const GameDetailsSkeleton = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-8 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-20">
            <div>
              <SkeletonLoader width="w-40" height="h-6" className="mb-1" />
              <SkeletonLoader width="w-24" height="h-4" />
            </div>
            <SkeletonLoader width="w-16" height="h-8" className="rounded-lg" />
          </div>

          {/* Event header */}
          <div className="text-center mb-16">
            <SkeletonLoader width="w-48" height="h-8" className="mx-auto mb-4" />
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <SkeletonLoader width="w-4" height="h-4" />
                <SkeletonLoader width="w-32" height="h-4" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <SkeletonLoader width="w-4" height="h-4" />
                <SkeletonLoader width="w-40" height="h-4" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <SkeletonLoader width="w-4" height="h-4" />
                <SkeletonLoader width="w-28" height="h-4" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <SkeletonLoader width="w-4" height="h-4" />
                <SkeletonLoader width="w-36" height="h-4" />
              </div>
            </div>
          </div>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mb-12"></div>

          {/* Players */}
          <div className="mb-16">
            <SkeletonLoader width="w-24" height="h-4" className="mx-auto mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-900 last:border-0">
                  <div className="flex items-center gap-3">
                    <SkeletonLoader width="w-6" height="h-6" className="rounded-full" />
                    <SkeletonLoader width="w-20" height="h-4" />
                  </div>
                  <SkeletonLoader width="w-12" height="h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-6">
            <SkeletonLoader width="w-full" height="h-12" className="rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <SkeletonLoader width="w-full" height="h-10" className="rounded-lg" />
              <SkeletonLoader width="w-full" height="h-10" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SkeletonLoader, GameCardSkeleton, GameDetailsSkeleton };