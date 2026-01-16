import bobbyData from '../../../posts_data/bobby_moment_data.json';
import michelleData from '../../../posts_data/michelle_moment_data.json';
import type { ProfilePair, SocialProfile, Post } from './types';

const BOBBY_BIO = "NYC tech founder love adventure travel coding with ai playing soccer and hanging with friends and Michelle is my awesome cofounder";
const MICHELLE_BIO = "Pilates, saunas wellness but also I love a glass of wine I'm also a tech founder by day";

interface RawPost {
  created_at: string;
  caption: string | null;
  memory: string;
}

function transformPost(raw: RawPost, index: number, prefix: string): Post {
  let content = raw.memory;
  if (raw.caption) {
    content = `${raw.memory}\n\nCaption: "${raw.caption}"`;
  }

  // Normalize date: "2026-01-15 01:19:15.331956+00" -> ISO format
  // Replace space with T and fix timezone (+00 -> +00:00)
  const normalized = raw.created_at.replace(' ', 'T').replace(/\+(\d{2})$/, '+$1:00');
  const timestamp = new Date(normalized).toISOString();
  const mentions = content.match(/@\w+/g) || undefined;

  return {
    id: `${prefix}-post-${index + 1}`,
    timestamp,
    content,
    tags: mentions,
  };
}

function transformProfile(rawPosts: RawPost[], id: string, name: string, bio: string): SocialProfile {
  return {
    id,
    name,
    bio,
    posts: rawPosts.map((post, i) => transformPost(post, i, id)),
  };
}

export function loadRealProfiles(): ProfilePair {
  return {
    personA: transformProfile(bobbyData as RawPost[], 'bobby', 'Bobby', BOBBY_BIO),
    personB: transformProfile(michelleData as RawPost[], 'michelle', 'Michelle', MICHELLE_BIO),
  };
}
