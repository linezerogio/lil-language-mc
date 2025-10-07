import { NextRequest, NextResponse } from 'next/server';
import { saveSubmission } from '@/app/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lines, score, keyword, mode, difficulty, scoreBreakdown } = body;

        if (!lines || !keyword || !mode || !difficulty || score === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const submissionId = await saveSubmission(
            lines,
            score,
            keyword,
            mode,
            difficulty
        );

        return NextResponse.json({ id: submissionId }, { status: 201 });
    } catch (error) {
        console.error('Error saving submission:', error);
        return NextResponse.json(
            { error: 'Failed to save submission' },
            { status: 500 }
        );
    }
}

