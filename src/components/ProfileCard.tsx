'use client';

import { useState } from 'react';
import type { SocialProfile } from '@/lib/profiles/types';

interface ProfileCardProps {
  profile: SocialProfile;
  variant: 'a' | 'b';
  isActive?: boolean;
}

export function ProfileCard({ profile, variant, isActive }: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isA = variant === 'a';
  const label = isA ? 'Person A' : 'Person B';

  // Get sample posts for preview
  const samplePosts = profile.posts.slice(0, 5);

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        transition-all duration-500 ease-out
        ${isA
          ? 'bg-gradient-to-br from-terracotta-950/80 via-terracotta-900/40 to-stone-950/80 border-terracotta-700/30'
          : 'bg-gradient-to-br from-cyan-950/80 via-cyan-900/40 to-slate-950/80 border-cyan-700/30'
        }
        ${isActive ? 'ring-2 ring-offset-2 ring-offset-stone-950' : ''}
        ${isActive && isA ? 'ring-terracotta-500/60' : ''}
        ${isActive && !isA ? 'ring-cyan-500/60' : ''}
      `}
      style={{
        animationDelay: isA ? '0ms' : '100ms',
      }}
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
              <span className="text-[10px] text-stone-500">· {profile.posts.length} posts</span>
            </div>
            <h3 className="mt-2 text-xl font-display font-semibold text-white tracking-tight">
              {profile.name}
            </h3>
            <p className="mt-1 text-sm text-stone-400 leading-relaxed">
              {profile.bio}
            </p>
          </div>
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-xl font-display font-bold shrink-0 ml-4
              ${isA ? 'bg-terracotta-500/20 text-terracotta-400' : 'bg-cyan-500/20 text-cyan-400'}
            `}
          >
            {profile.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Sample Posts Preview */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2">
          Recent Posts
        </p>
        <div className="space-y-2">
          {samplePosts.slice(0, isExpanded ? 5 : 2).map((post) => (
            <div
              key={post.id}
              className={`
                p-3 rounded-lg text-sm text-stone-300 leading-relaxed
                ${isA ? 'bg-terracotta-900/20' : 'bg-cyan-900/20'}
              `}
            >
              <p className="line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-500">
                {post.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {post.location}
                  </span>
                )}
                {post.tags && post.tags.length > 0 && (
                  <span className="truncate">{post.tags.slice(0, 2).join(' ')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse */}
      {samplePosts.length > 2 && (
        <div className="border-t border-stone-800/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-full px-5 py-3 flex items-center justify-between text-xs font-mono uppercase tracking-wider
              transition-colors duration-200
              ${isA ? 'text-terracotta-400 hover:text-terracotta-300' : 'text-cyan-400 hover:text-cyan-300'}
            `}
          >
            <span>{isExpanded ? 'Show less' : `Show ${samplePosts.length - 2} more posts`}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
