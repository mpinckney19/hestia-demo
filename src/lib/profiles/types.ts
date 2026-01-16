/**
 * Profile types for social media-based user profiles (V2)
 * The AI learns who someone is from their posts, then applies that understanding to any scenario.
 */

export interface Post {
  id: string;
  timestamp: string;       // ISO date
  content: string;         // ~50 words describing the post + caption
  location?: string;       // Optional location tag
  tags?: string[];         // Optional hashtags or tagged people
}

export interface SocialProfile {
  id: string;
  name: string;
  bio: string;             // Short, like a real bio: "Designer @ Figma | BK | pizza emoji"
  posts: Post[];           // 50 posts
}

export interface ProfilePair {
  personA: SocialProfile;
  personB: SocialProfile;
  // Tension points are discovered naturally from posts, not prescribed
}
