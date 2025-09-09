import { NextResponse } from 'next/server';
import { getLessons } from '@/lib/database';

export async function GET() {
  try {
    const lessons = getLessons();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}