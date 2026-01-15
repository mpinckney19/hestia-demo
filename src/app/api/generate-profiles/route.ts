import { NextResponse } from 'next/server';
import { generateProfiles } from '@/lib/profiles/generator';

export async function POST() {
  try {
    const profiles = await generateProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Profile generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate profiles' },
      { status: 500 }
    );
  }
}
