'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/profiles/types';

interface ProfileCardProps {
  profile: UserProfile;
  variant: 'a' | 'b';
  isActive?: boolean;
}

export function ProfileCard({ profile, variant, isActive }: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isA = variant === 'a';
  const label = isA ? 'Person A' : 'Person B';

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
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded
                  ${isA ? 'bg-terracotta-500/20 text-terracotta-300' : 'bg-cyan-500/20 text-cyan-300'}
                `}
              >
                {label}
              </span>
              <span className="text-[10px] text-stone-500">· Hestia Agent</span>
            </div>
            <h3 className="mt-2 text-xl font-display font-semibold text-white tracking-tight">
              {profile.name}
            </h3>
          </div>
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-lg font-display font-bold
              ${isA ? 'bg-terracotta-500/20 text-terracotta-400' : 'bg-cyan-500/20 text-cyan-400'}
            `}
          >
            {profile.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Budget</p>
          <p className="text-sm font-medium text-stone-200">${profile.constraints.budget}/person</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Available</p>
          <p className="text-sm font-medium text-stone-200">
            {profile.constraints.availability.start} - {profile.constraints.availability.end}
          </p>
        </div>
      </div>

      {/* Preferences Tags */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2">
          Preferences
        </p>
        <div className="flex flex-wrap gap-1.5">
          {profile.preferences.cuisines.slice(0, 3).map((cuisine) => (
            <span
              key={cuisine}
              className={`
                px-2 py-0.5 text-xs rounded-full border
                ${isA
                  ? 'bg-terracotta-500/10 border-terracotta-500/20 text-terracotta-200'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
                }
              `}
            >
              {cuisine}
            </span>
          ))}
          {profile.preferences.activityTypes.slice(0, 2).map((activity) => (
            <span
              key={activity}
              className="px-2 py-0.5 text-xs rounded-full border bg-stone-800/50 border-stone-700/50 text-stone-300"
            >
              {activity}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-stone-800/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            w-full px-5 py-3 flex items-center justify-between text-xs font-mono uppercase tracking-wider
            transition-colors duration-200
            ${isA ? 'text-terracotta-400 hover:text-terracotta-300' : 'text-cyan-400 hover:text-cyan-300'}
          `}
        >
          <span>{isExpanded ? 'Less details' : 'More details'}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className={`
            overflow-hidden transition-all duration-500 ease-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-5 pb-5 space-y-4">
            {/* Dietary Restrictions */}
            {profile.preferences.dietaryRestrictions.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1.5">
                  Dietary
                </p>
                <p className="text-sm text-stone-300">
                  {profile.preferences.dietaryRestrictions.join(', ')}
                </p>
              </div>
            )}

            {/* Neighborhoods */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1.5">
                Preferred Areas
              </p>
              <p className="text-sm text-stone-300">
                {profile.preferences.neighborhoods.join(', ')}
              </p>
            </div>

            {/* Personality */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1.5">
                Priorities
              </p>
              <p className="text-sm text-stone-300">
                {profile.personality.priorities.join(' · ')}
              </p>
            </div>

            {/* Dealbreakers */}
            {profile.personality.dealbreakers.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-red-400/70 mb-1.5">
                  Dealbreakers
                </p>
                <p className="text-sm text-stone-400">
                  {profile.personality.dealbreakers.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
