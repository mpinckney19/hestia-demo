'use client';

interface ProfileCardSkeletonProps {
  variant: 'a' | 'b';
}

export function ProfileCardSkeleton({ variant }: ProfileCardSkeletonProps) {
  const isA = variant === 'a';
  const label = isA ? 'Person A' : 'Person B';

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        ${isA
          ? 'bg-gradient-to-br from-terracotta-950/80 via-terracotta-900/40 to-stone-950/80 border-terracotta-700/30'
          : 'bg-gradient-to-br from-cyan-950/80 via-cyan-900/40 to-slate-950/80 border-cyan-700/30'
        }
      `}
    >
      {/* Decorative corner accent */}
      <div
        className={`
          absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20
          ${isA ? 'bg-terracotta-500' : 'bg-cyan-500'}
        `}
      />

      {/* Header */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded
                  ${isA ? 'bg-terracotta-500/20 text-terracotta-300' : 'bg-cyan-500/20 text-cyan-300'}
                `}
              >
                {label}
              </span>
              <span className="text-[10px] text-stone-500">· generating...</span>
            </div>
            {/* Skeleton name */}
            <div className={`mt-2 h-7 w-40 rounded-lg animate-pulse ${isA ? 'bg-terracotta-800/50' : 'bg-cyan-800/50'}`} />
            {/* Skeleton bio - two lines */}
            <div className="mt-2 space-y-2">
              <div className={`h-4 w-full rounded animate-pulse ${isA ? 'bg-terracotta-900/40' : 'bg-cyan-900/40'}`} />
              <div className={`h-4 w-3/4 rounded animate-pulse ${isA ? 'bg-terracotta-900/40' : 'bg-cyan-900/40'}`} />
            </div>
          </div>
          {/* Animated avatar */}
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl font-display font-bold shrink-0 ml-4
              animate-pulse
              ${isA ? 'bg-terracotta-500/30 text-terracotta-400' : 'bg-cyan-500/30 text-cyan-400'}
            `}
          >
            <span className="animate-pulse">{isA ? 'A' : 'B'}</span>
          </div>
        </div>
      </div>

      {/* Sample Posts Preview - Skeletons */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2">
          Loading Posts
        </p>
        <div className="space-y-2">
          {[0, 1].map((index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg animate-pulse
                ${isA ? 'bg-terracotta-900/20' : 'bg-cyan-900/20'}
              `}
            >
              {/* Skeleton post content */}
              <div className="space-y-2">
                <div className={`h-4 w-full rounded ${isA ? 'bg-terracotta-800/40' : 'bg-cyan-800/40'}`} />
                <div className={`h-4 w-5/6 rounded ${isA ? 'bg-terracotta-800/40' : 'bg-cyan-800/40'}`} />
              </div>
              {/* Skeleton metadata */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-3 w-20 rounded ${isA ? 'bg-terracotta-900/30' : 'bg-cyan-900/30'}`} />
                <div className={`h-3 w-16 rounded ${isA ? 'bg-terracotta-900/30' : 'bg-cyan-900/30'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer overlay effect */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          bg-gradient-to-r from-transparent via-white/5 to-transparent
          -translate-x-full animate-[shimmer_2s_infinite]
        `}
        style={{
          animationName: 'shimmer',
        }}
      />
    </div>
  );
}
