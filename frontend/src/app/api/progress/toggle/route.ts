import { NextRequest, NextResponse } from 'next/server';
import { toggleProgress } from '@/lib/database';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 1, lessonId } = body; // Default user for MVP
    
    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      );
    }
    
    const result = toggleProgress(parseInt(userId), parseInt(lessonId));
    
    return NextResponse.json({
      success: true,
      completed: result.completed,
      lessonId: parseInt(lessonId)
    });
  } catch (error) {
    console.error('Error toggling progress:', error);
    return NextResponse.json(
      { error: 'Failed to toggle progress' },
      { status: 500 }
    );
  }
}