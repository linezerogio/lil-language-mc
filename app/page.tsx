import { generate, count } from 'random-words'
import { getWordByDifficulty, getWordData } from './server';
import postgres from 'postgres';
import FreestyleForm from '@/components/FreestyleForm';
import StartSection from '@/components/StartSection';

export default async function Home() {
  // Function returns one by default but not as array so we explicitly define 1 for consistency
  const words = generate(1);
  const wordData = await getWordData(words.at(0) ?? "");

  const word = await getWordByDifficulty("medium");

  return (
    <main className='w-full max-w-[2560px] md:mx-auto h-full'>
      <StartSection />
    </main>
  )
}
