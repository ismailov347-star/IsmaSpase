import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getProgressStats } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1'; // Default user for MVP
    
    const progress = getUserProgress(parseInt(userId));
    const stats = getProgressStats(parseInt(userId));
    
    return NextResponse.json({
      progress,
      stats
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}