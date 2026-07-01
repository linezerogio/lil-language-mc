import { testRaps } from '@/util/testRaps';
import MultiRhymeView from '@/components/MultiRhymeView';
import Header from '@/components/Header';

export default function MultiRhymePage() {
  return (
    <main className="max-w-[2560px] w-full h-full px-[30px] lg:px-[100px] pt-[30px] lg:pt-[50px] mx-auto">
      <Header difficulty="easy" />
      <div className="mt-8 space-y-12">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-black dark:text-white">
            Multi-Syllable Rhyme Recognition
          </h1>
          <p className="text-[#565757] dark:text-[#B2B2B2] mb-8">
            Test and develop multi-syllable rhyme recognition. Words that rhyme with each other are highlighted in the same color, 
            showing recurring rhyme schemes throughout the rap. Each rhyme group gets a unique color.
          </p>
        </div>
        {testRaps.map((rap) => (
          <MultiRhymeView key={rap.id} rap={rap} />
        ))}
      </div>
    </main>
  );
}

