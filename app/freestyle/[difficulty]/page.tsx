import { getWordByDifficulty, getWordData, Word } from '../../server';
import FreestyleForm from '@/components/FreestyleForm';
import { Difficulty } from '@/types/difficulty';

export default async function FreestylePage({params: {difficulty}}: {params: {difficulty: Difficulty | "zbra-easy" | "zbra-hard"}}) {
  // Function returns one by default but not as array so we explicitly define 1 for consistency
  // const words = generate(1);
  // const wordData = await getWordData(words.at(0) ?? "");

  // let word: Word | undefined;

  const word = await getWordByDifficulty(difficulty);

  return (
    <main className='mx-auto h-full'>
      <FreestyleForm word={word?.word ?? ""} difficulty={difficulty} />
    </main>
  )
}
