import { useState, useCallback } from 'react';
import type { ProfilePair } from '@/lib/profiles/types';

interface UseProfilesState {
  profiles: ProfilePair | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfiles() {
  const [state, setState] = useState<UseProfilesState>({
    profiles: null,
    isLoading: false,
    error: null,
  });

  const generateProfiles = useCallback(async () => {
    setState({ profiles: null, isLoading: true, error: null });

    try {
      const response = await fetch('/api/generate-profiles', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate profiles');
      }

      const profiles = (await response.json()) as ProfilePair;
      setState({ profiles, isLoading: false, error: null });
      return profiles;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setState({ profiles: null, isLoading: false, error: message });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ profiles: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    generateProfiles,
    reset,
  };
}
