import { getWordByDifficulty, getWordData, Word } from '../../server';
import EndlessForm from '@/components/EndlessForm';
import { Difficulty } from '@/types/difficulty';

export default async function EndlessPage({params: {difficulty}}: {params: {difficulty: Difficulty | "zbra-easy" | "zbra-hard"}}) {
  const word = await getWordByDifficulty(difficulty);

  return (
    <main className='mx-auto h-full'>
      <EndlessForm word={word?.word ?? ""} difficulty={difficulty} />
    </main>
  )
}
