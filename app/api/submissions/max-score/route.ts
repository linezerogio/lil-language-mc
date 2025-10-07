import { NextRequest, NextResponse } from 'next/server';
import { getMaxSubmissionScore, getMaxWordScore } from '@/app/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    try {
        if (word) {
            const max = await getMaxWordScore(word);
            console.log('Max word score:', max);
            return NextResponse.json({ max });
        }
        const max = await getMaxSubmissionScore();
        return NextResponse.json({ max });
    } catch (error) {
        console.error('Error fetching max submission score:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}


