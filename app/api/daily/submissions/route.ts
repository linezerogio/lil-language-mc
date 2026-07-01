import { NextRequest, NextResponse } from 'next/server';
import { saveDailySubmission } from '@/app/daily/server';
import { isDailyMode } from '@/util/daily';

export const dynamic = 'force-dynamic';

function sanitizeLines(lines: unknown) {
  if (!Array.isArray(lines)) {
    return null;
  }

  const cleaned = lines
    .filter((line): line is string => typeof line === 'string')
    .filter((line) => line.trim() !== '');

  return cleaned.length > 0 ? cleaned : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerId = typeof body.playerId === 'string' ? body.playerId.trim() : '';
    const mode = body.mode;
    const lines = sanitizeLines(body.lines);
    const score = Number(body.score);

    if (!playerId || playerId.length > 128 || !isDailyMode(mode) || !lines || !Number.isFinite(score)) {
      return NextResponse.json({ error: 'Missing or invalid Daily submission fields' }, { status: 400 });
    }

    const result = await saveDailySubmission({
      playerId,
      mode,
      lines,
      score,
    });

    if (result.ok) {
      return NextResponse.json({ id: result.submissionId }, { status: 201 });
    }

    if (result.error === 'already_played') {
      return NextResponse.json(
        { error: 'already_played', id: result.submissionId },
        { status: 409 },
      );
    }

    if (result.error === 'missing_challenge') {
      return NextResponse.json({ error: 'Daily challenge not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to save Daily submission' }, { status: 500 });
  } catch (error) {
    console.error('Error saving Daily submission:', error);
    return NextResponse.json({ error: 'Failed to save Daily submission' }, { status: 500 });
  }
}
