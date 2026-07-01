import { getWordByDifficulty, getWordData, Word } from '../../server';
import EndlessForm from '@/components/EndlessForm';
import { Difficulty } from '@/types/difficulty';
import { redirect } from 'next/navigation';

export default async function EndlessPage({params: {difficulty}}: {params: {difficulty: Difficulty | "zbra-easy" | "zbra-hard"}}) {
  if (difficulty === 'daily') {
    redirect('/daily/endless');
  }

  const word = await getWordByDifficulty(difficulty);

  return (
    <main className='mx-auto h-full'>
      <EndlessForm word={word?.word ?? ""} difficulty={difficulty} />
    </main>
  )
}
