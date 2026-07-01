import { NextRequest, NextResponse } from 'next/server';
import { getDailyOverview } from '@/app/daily/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const playerIdParam = request.nextUrl.searchParams.get('playerId');
    const playerId = playerIdParam?.trim() || undefined;

    if (playerId && playerId.length > 128) {
      return NextResponse.json({ error: 'Invalid player id' }, { status: 400 });
    }

    const overview = await getDailyOverview(playerId);
    if (!overview) {
      return NextResponse.json({ error: 'Daily challenge not found' }, { status: 404 });
    }

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching Daily overview:', error);
    return NextResponse.json({ error: 'Failed to fetch Daily overview' }, { status: 500 });
  }
}
