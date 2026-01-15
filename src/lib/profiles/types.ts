/**
 * Profile types for AI-generated user profiles
 */

export interface UserPreferences {
  cuisines: string[];
  dietaryRestrictions: string[];
  priceRange: 'budget' | 'moderate' | 'upscale' | 'splurge';
  activityTypes: string[];
  neighborhoods: string[];
  socialStyle: 'intimate' | 'lively' | 'adventurous';
}

export interface UserConstraints {
  availability: {
    start: string; // e.g., "6:00 PM"
    end: string;   // e.g., "11:00 PM"
  };
  budget: number; // max per person in USD
  mobilityLimitations?: string;
  mustAvoid?: string[];
}

export interface UserPersonality {
  communicationStyle: string;
  priorities: string[];
  dealbreakers: string[];
}

export interface UserBackground {
  childhoodMemories: string[];
  workAnecdotes: string[];
  randomFacts: string[];
  recentEvents: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  preferences: UserPreferences;
  constraints: UserConstraints;
  personality: UserPersonality;
  background: UserBackground;
}

export interface TensionPoint {
  category: string;
  personAPosition: string;
  personBPosition: string;
  resolutionHint: string;
}

export interface ProfilePair {
  personA: UserProfile;
  personB: UserProfile;
  tensionPoints: TensionPoint[];
}
