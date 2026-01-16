'use client';

import type { AgreedPlan, PlannedActivity } from '@/lib/agents/types';
import { renderMarkdown } from '@/lib/markdown';

interface FinalPlanProps {
  plan: AgreedPlan;
}

/**
 * Timeline display for friday_night scenario
 */
function Timeline({ activities }: { activities: PlannedActivity[] }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-4">
        Schedule
      </p>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-terracotta-500 via-amber-500 to-cyan-500" />

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex gap-4 items-start group">
              {/* Timeline dot */}
              <div className="relative z-10 mt-1.5">
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110
                    ${index === 0
                      ? 'border-terracotta-500 bg-terracotta-500/20'
                      : index === activities.length - 1
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-amber-500 bg-amber-500/20'
                    }
                  `}
                >
                  <div
                    className={`
                      w-2 h-2 rounded-full
                      ${index === 0
                        ? 'bg-terracotta-400'
                        : index === activities.length - 1
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                      }
                    `}
                  />
                </div>
              </div>

              {/* Activity content */}
              <div className="flex-1 pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-medium text-stone-400">
                    {activity.time}
                  </span>
                  {activity.location !== 'NYC' && (
                    <span className="text-xs text-stone-600">@ {activity.location}</span>
                  )}
                </div>
                <p className="mt-1 text-stone-200">{activity.activity}</p>
                {activity.notes && (
                  <p className="mt-1 text-sm text-stone-500 italic">{activity.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Gift recommendations display for gift_recs scenario
 */
function GiftDisplay({ rawText }: { rawText: string }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-4">
        Gift Recommendations
      </p>
      <div className="prose-gift">
        {renderMarkdown(rawText)}
      </div>
    </div>
  );
}

/**
 * Generic plan details display - formatted raw text with markdown support
 */
function PlanDetails({ rawText, scenarioId }: { rawText: string; scenarioId: string }) {
  // Determine section label based on scenario
  const sectionLabel = scenarioId === 'weekend_trip'
    ? 'Itinerary'
    : scenarioId === 'event'
    ? 'Event Details'
    : 'Plan Details';

  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-4">
        {sectionLabel}
      </p>
      <div className="prose-plan">
        {renderMarkdown(rawText)}
      </div>
    </div>
  );
}

/**
 * Compromises section
 */
function Compromises({ items }: { items: string[] }) {
  return (
    <div className="px-6 py-5 border-t border-stone-800/50">
      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-3">
        Compromises Made
      </p>
      <div className="space-y-2">
        {items.map((compromise, index) => (
          <div key={index} className="flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 text-amber-500/70 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <p className="text-sm text-stone-400">{compromise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinalPlan({ plan }: FinalPlanProps) {
  // Determine if we have valid timeline activities (with actual times)
  const hasValidTimelineActivities =
    plan.scenarioId === 'friday_night' &&
    plan.activities.length > 0 &&
    plan.activities.some(a => /\d/.test(a.time) && a.time !== 'As planned');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-terracotta-600 via-amber-500 to-cyan-500 p-px">
        <div className="bg-stone-950 rounded-t-2xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                Agreement Reached
              </p>
              <h3 className="text-lg font-display font-semibold text-white">
                {plan.scenarioLabel} Plan
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-b from-stone-900/80 to-stone-950/80 backdrop-blur-xl border-x border-b border-stone-800/50 rounded-b-2xl">
        {/* Summary */}
        <div className="px-6 py-5 border-b border-stone-800/50">
          <p className="text-stone-300 leading-relaxed">{plan.summary}</p>
        </div>

        {/* Scenario-specific content */}
        {hasValidTimelineActivities && (
          <Timeline activities={plan.activities} />
        )}

        {plan.scenarioId === 'gift_recs' && (
          <GiftDisplay rawText={plan.rawPlanText} />
        )}

        {/* Fallback for other scenarios or when timeline parsing failed */}
        {!hasValidTimelineActivities && plan.scenarioId !== 'gift_recs' && (
          <PlanDetails rawText={plan.rawPlanText} scenarioId={plan.scenarioId} />
        )}

        {/* Compromises */}
        {plan.compromises.length > 0 && (
          <Compromises items={plan.compromises} />
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-terracotta-950/50 via-stone-900/50 to-cyan-950/50 rounded-b-2xl">
          <p className="text-center text-xs text-stone-600">
            Negotiated by Hestia AI Assistants
          </p>
        </div>
      </div>
    </div>
  );
}
