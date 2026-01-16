'use client';

import { useCallback, useState, useEffect } from 'react';
import { useProfiles } from '@/hooks/useProfiles';
import { useCoordination } from '@/hooks/useCoordination';
import { ProfileCard } from './ProfileCard';
import { ProfileCardSkeleton } from './ProfileCardSkeleton';
import { ConversationViewer } from './ConversationViewer';
import { FinalPlan } from './FinalPlan';

const STATUS_MESSAGES = [
  'Crafting personalities...',
  'Generating social posts...',
  'Adding preferences and quirks...',
  'Building digital personas...',
  'Creating unique backgrounds...',
];

const SCENARIOS = [
  {
    id: 'friday_night',
    label: 'Friday Night',
    directive: 'Plan a Friday night out in NYC that works for both people.',
  },
  {
    id: 'weekend_trip',
    label: 'Weekend Trip',
    directive: 'Plan a weekend getaway that works for both people.',
  },
  {
    id: 'gift_recs',
    label: 'Gifts',
    directive: 'Help each person find a gift the other would appreciate.',
  },
  {
    id: 'event',
    label: 'Event',
    directive: 'Find an event or activity both people would enjoy this weekend.',
  },
];

export function DemoContainer() {
  const { profiles, isLoading: isGenerating, generateProfiles, reset: resetProfiles } = useProfiles();
  const { state, startCoordination, reset: resetCoordination } = useCoordination();
  const [viewMode, setViewMode] = useState<'plan' | 'conversation'>('plan');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  // Rotate status messages during generation
  useEffect(() => {
    if (!isGenerating) {
      setStatusMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Derive phase from state
  const phase = isGenerating
    ? 'generating'
    : state.status === 'agreed'
    ? 'complete'
    : state.status === 'coordinating'
    ? 'coordinating'
    : profiles && !selectedScenario
    ? 'select_scenario'
    : profiles && selectedScenario
    ? 'ready'
    : 'idle';

  const handleGenerateProfiles = useCallback(async () => {
    try {
      await generateProfiles();
    } catch (error) {
      console.error('Failed to generate profiles:', error);
    }
  }, [generateProfiles]);

  const handleSelectScenario = useCallback((scenarioId: string) => {
    setSelectedScenario(scenarioId);
  }, []);

  const handleStartCoordination = useCallback(async () => {
    if (!profiles || !selectedScenario) return;
    const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
    if (!scenario) return;

    try {
      await startCoordination(profiles, scenario.directive, scenario.id, scenario.label);
    } catch (error) {
      console.error('Failed to start coordination:', error);
    }
  }, [profiles, selectedScenario, startCoordination]);

  const handleReset = useCallback(() => {
    resetProfiles();
    resetCoordination();
    setSelectedScenario(null);
    setViewMode('plan');
  }, [resetProfiles, resetCoordination]);

  const isActive = phase === 'coordinating' || phase === 'complete';
  const showProfiles = profiles || state.profiles;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-terracotta-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-stone-800/50 backdrop-blur-xl bg-stone-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-lg">H</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-950" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-lg tracking-tight">Hestia</h1>
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                  AI Coordination Demo
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {phase !== 'idle' && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Reset
                </button>
              )}
              {phase === 'idle' && (
                <button
                  onClick={handleGenerateProfiles}
                  disabled={isGenerating}
                  className="relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden bg-gradient-to-r from-terracotta-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-terracotta-500/25 hover:-translate-y-0.5"
                >
                  Generate Profiles
                </button>
              )}
              {phase === 'generating' && (
                <div className="px-5 py-2.5 rounded-xl font-medium text-sm bg-stone-800 text-stone-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Profiles...
                  </span>
                </div>
              )}
              {(phase === 'ready' || phase === 'select_scenario') && (
                <button
                  onClick={handleStartCoordination}
                  disabled={!selectedScenario}
                  className={`
                    relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden
                    ${selectedScenario
                      ? 'bg-gradient-to-r from-terracotta-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-terracotta-500/25 hover:-translate-y-0.5'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }
                  `}
                >
                  Start Planning
                </button>
              )}
              {phase === 'coordinating' && (
                <div className="px-5 py-2.5 rounded-xl font-medium text-sm bg-stone-800 text-stone-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Coordinating...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome State - only show when idle AND not generating */}
        {phase === 'idle' && !showProfiles && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-terracotta-500/20 to-cyan-500/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-terracotta-500/80 flex items-center justify-center text-white text-xs font-mono font-bold">
                A
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-cyan-500/80 flex items-center justify-center text-white text-xs font-mono font-bold">
                B
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-3">
              AI-Powered Planning
            </h2>
            <p className="text-stone-400 max-w-md mb-8 leading-relaxed">
              Watch two AI assistants learn who someone is from their social media posts,
              then negotiate on their behalf.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-500/10 border border-terracotta-500/20 text-terracotta-300">
                <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                Learn from Posts
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Advocate & Negotiate
              </div>
            </div>
          </div>
        )}

        {/* Generating State - show skeleton cards */}
        {phase === 'generating' && (
          <div className="animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <ProfileCardSkeleton variant="a" />
              <ProfileCardSkeleton variant="b" />
            </div>
            {/* Rotating status messages */}
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <p className="text-sm text-stone-400 animate-pulse">
                  {STATUS_MESSAGES[statusMessageIndex]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profiles Grid - when loaded */}
        {showProfiles && phase !== 'generating' && (
          <div className="grid md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProfileCard
              profile={showProfiles.personA}
              variant="a"
              isActive={state.currentSpeaker === 'hestia_a'}
            />
            <ProfileCard
              profile={showProfiles.personB}
              variant="b"
              isActive={state.currentSpeaker === 'hestia_b'}
            />
          </div>
        )}

        {/* Scenario Selector */}
        {(phase === 'select_scenario' || phase === 'ready') && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
            <div className="rounded-2xl border border-stone-800/50 backdrop-blur-xl bg-stone-900/30 p-6">
              <h3 className="text-lg font-display font-semibold mb-2">Choose a Scenario</h3>
              <p className="text-sm text-stone-400 mb-4">
                The same profiles can be used for different coordination scenarios.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleSelectScenario(scenario.id)}
                    className={`
                      p-4 rounded-xl text-left transition-all duration-200 border
                      ${selectedScenario === scenario.id
                        ? 'bg-gradient-to-br from-terracotta-500/20 to-cyan-500/20 border-terracotta-500/50'
                        : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800 hover:border-stone-600'
                      }
                    `}
                  >
                    <span className="font-medium text-stone-100">{scenario.label}</span>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">{scenario.directive}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation or Final Plan */}
        {isActive && (
          <div
            className="rounded-2xl border border-stone-800/50 backdrop-blur-xl bg-stone-900/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '200ms' }}
          >
            {state.status === 'agreed' && state.finalPlan ? (
              <div>
                {/* Tab Navigation */}
                <div className="flex border-b border-stone-800/50">
                  <button
                    onClick={() => setViewMode('plan')}
                    className={`px-5 py-3 text-sm font-medium transition-colors ${
                      viewMode === 'plan'
                        ? 'text-white border-b-2 border-terracotta-500'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    Final Plan
                  </button>
                  <button
                    onClick={() => setViewMode('conversation')}
                    className={`px-5 py-3 text-sm font-medium transition-colors ${
                      viewMode === 'conversation'
                        ? 'text-white border-b-2 border-cyan-500'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    Conversation ({state.messages.length})
                  </button>
                </div>

                {/* Tab Content */}
                {viewMode === 'plan' ? (
                  <div className="p-6">
                    <FinalPlan plan={state.finalPlan} />
                  </div>
                ) : (
                  <div className="h-[500px] flex flex-col">
                    <ConversationViewer
                      messages={state.messages}
                      currentMessage={undefined}
                      currentSpeaker={undefined}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[500px] flex flex-col">
                {/* Conversation Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-terracotta-500/20 border-2 border-stone-900 flex items-center justify-center text-xs font-mono font-bold text-terracotta-400">
                        A
                      </div>
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-stone-900 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                        B
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-200">Negotiation in Progress</p>
                      <p className="text-xs text-stone-500">
                        {state.messages.length} message{state.messages.length !== 1 ? 's' : ''} exchanged
                      </p>
                    </div>
                  </div>
                  {state.currentSpeaker && (
                    <div
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2
                        ${state.currentSpeaker === 'hestia_a'
                          ? 'bg-terracotta-500/10 text-terracotta-300 border border-terracotta-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        }
                      `}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {state.currentSpeaker === 'hestia_a' ? 'Person A' : 'Person B'}&apos;s turn
                    </div>
                  )}
                </div>

                {/* Conversation Content */}
                <ConversationViewer
                  messages={state.messages}
                  currentMessage={state.currentMessage}
                  currentSpeaker={state.currentSpeaker}
                />
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-200">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm text-red-300/70 mt-1">{state.error}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-800/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
            <p>Built with Claude Agent SDK</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Powered by Claude</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
