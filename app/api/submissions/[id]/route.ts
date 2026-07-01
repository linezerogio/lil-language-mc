import { NextRequest, NextResponse } from 'next/server';
import { getSubmission } from '@/app/server';
import { getDailyContextForSubmission } from '@/app/daily/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }

        const submission = await getSubmission(id);
        if (!submission) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const daily = await getDailyContextForSubmission(id);

        return NextResponse.json({ ...submission, daily });
    } catch (error) {
        console.error('Error fetching submission by id:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}


