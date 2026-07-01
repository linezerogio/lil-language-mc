import DailyPlay from '@/components/Daily/DailyPlay';
import { getTodayDailyChallenge } from '@/app/daily/server';

export const dynamic = 'force-dynamic';

export default async function DailyEndlessPage() {
  const challenge = await getTodayDailyChallenge();

  if (!challenge) {
    return (
      <main className="w-full max-w-[2560px] lg:mx-auto h-full flex items-center justify-center">
        <div className="text-[#FF273A]">Daily challenge not found</div>
      </main>
    );
  }

  return (
    <main className="mx-auto h-full">
      <DailyPlay challenge={challenge} mode="Endless Mode" />
    </main>
  );
}
