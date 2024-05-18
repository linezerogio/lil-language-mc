import React, { useState } from 'react';
import Image from 'next/image'
import ScoreBreakdown from '@/types/breakdown';
import { Progress } from '@radix-ui/react-progress';
import LinearProgressBar from './LinearProgressBar';

type Modifier = {
    text: string;
    positive: boolean;
    number: number;
}

interface ScoreBreakdownSectionProps {
    type: "Rhyme" | "Flow" | "Length" | "Speed";
    percentage: number;
    modifiers: Modifier[];
    showInfo: boolean;
    setShowInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ScoreBreakdownViewProps {
    scoreBreakdown: ScoreBreakdown;
}

const ScoreBreakdownSection: React.FC<ScoreBreakdownSectionProps> = ({ type, percentage, modifiers, showInfo, setShowInfo }) => {

    return (
            <div className='flex flex-1 flex-col p-[25px]'>
                <div className='flex flex-col h-[76px] w-full'>
                    <div className='flex items-center mb-[10px] h-[50px]'>
                        <div className='flex items-center w-[50px] h-full'>
                            <div className='relative w-[16.17px] h-[19.2px] md:w-[33.33px] md:h-[39.58px] mr-[10px]'>
                                <Image src={`/icons/${type}.svg`}
                                    layout='fill'
                                    objectFit='contain' alt={`${type} Icon`} />
                            </div>
                        </div>
                        <p className="text-[24px] font-semibold">{type}</p>
                        <button className='ml-auto min-w-[30px] min-h-[30px] justify-end flex items-center' onClick={() => setShowInfo(!showInfo)}>
                            <Image src="/icons/Info.svg" width={20} height={20} alt="Info Icon" className='' />
                        </button>
                    </div>
                    {/* Linear Progress Bar */}
                    <LinearProgressBar progress={percentage} height={16} strokeWidth={16} activeColor="#5CE2C7" inactiveColor="#343737" />
                </div>
                <div className='flex flex-col pt-5'>
                    {modifiers.filter(
                        (modifier) => modifier.number > 0
                    ).map((modifier) => (
                        <div key={modifier.text} className='flex items-center'>
                            {modifier.positive ? <Image src="/icons/Positive.svg" width={16} height={16} alt="Positive Icon" /> : <Image src="/icons/Negative.svg" width={16} height={16} alt="Negative Icon" />}
                            <p className={`text-[16px] font-medium text-[#B2B2B2] pl-[10px]`}>{modifier.text}</p>
                            {modifier.number > 1 && <p className={`text-[12px] font-extrabold ${modifier.positive ? "text-[#5CE2C7]" : "text-[#FF273A]"} ml-1`}>({modifier.number})</p>}
                        </div>
                    ))}
                </div>
            </div>
        );
}

const ScoreBreakdownView: React.FC<ScoreBreakdownViewProps> = ({ scoreBreakdown }) => {
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const { rhymeBreakdown, flowBreakdown, lengthBreakdown, speedBreakdown } = scoreBreakdown;

    const rhymeModifiers: Modifier[] = [
        { text: "Ended with Punchline", positive: true, number: rhymeBreakdown.endedWithPunchline ? 1 : 0},
        { text: "Perfect Rhymes", positive: true, number: rhymeBreakdown.perfectRhymes },
        { text: "Near Rhymes", positive: true, number: rhymeBreakdown.nearRhymes }, 
        { text: "Typos", positive: false, number: rhymeBreakdown.typos },
        { text: "Repeated Words", positive: false, number: rhymeBreakdown.repeatedWords }
    ];

    const flowModifiers: Modifier[] = [
        { text: "Syllable Match", positive: true, number: flowBreakdown.syllableMatch },
        { text: "Rhyme Placement", positive: true, number: flowBreakdown.rhymePlacement },
        { text: "Syllable Difference", positive: false, number: flowBreakdown.syllableDifference }
    ];

    const lengthModifiers: Modifier[] = [
        { text: "Long Sentences", positive: true, number: lengthBreakdown.longSentences },
        { text: "Mid Sentences", positive: true, number: lengthBreakdown.midSentences },
        { text: "Short Sentences", positive: false, number: lengthBreakdown.shortSentences }
    ];

    const speedModifiers: Modifier[] = [
        { text: "Time Remaining", positive: true, number: speedBreakdown.timeRemaining },
        { text: "Ran Out of Time", positive: false, number: speedBreakdown.ranOutOfTime ? 1 : 0 }
    ];

    return (
        <div className='bg-[#1B1C1D] flex flex-1 rounded-[25px] ml-[45px] my-[43px] overflow-x-auto'>
            {showInfo && <div className='absolute top-0 left-0 w-full h-full bg-[#000000bb] z-20'>
                <div className='relative bg-[#1B1C1D] flex w-[1058px] h-[199px] top-[calc(50vh-99.5px)] left-[calc(50vw-529px)] bottom-0 rounded-[25px]'>
                <button className='absolute top-[25px] right-[25px] w-[15px] h-[15px] bg-[#1B1C1D] z-30' onClick={() => setShowInfo(!showInfo)}>
                    <Image src="/icons/Close.svg" width={20} height={20} alt="Close Icon" />
                </button>    
                {["Rhyme", "Flow", "Length", "Speed"].map((type) => (
                    <div key={type} className='flex flex-1 flex-col p-[25px]'>
                    <div className='flex flex-col h-[76px] w-full'>
                        <div className='flex items-center mb-[15px] h-[50px]'>
                            <div className='flex items-center w-[50px] h-full'>
                                <div className='relative w-[16.17px] h-[19.2px] md:w-[33.33px] md:h-[39.58px] mr-[10px]'>
                                    <Image src={`/icons/${type}.svg`}
                                        layout='fill'
                                        objectFit='contain' alt={`${type} Icon`} />
                                </div>
                            </div>
                            <p className="text-[24px] font-semibold">{type}</p>
                        </div>
                        <p className='text-[16px] text-[#B2B2B2] text-left'>
                            {type === "Rhyme" && "The more exact and near rhymes you end your sentences with, the higher this core."}
                            {type === "Flow" && "Based on how often you have exact or near matching syllables."}
                            {type === "Length" && "The longer each of your sentences are, the higher this score will be."}
                            {type === "Speed" && "The more time remaining, the higher this score is."}
                        </p>
                    </div>
                </div>
                ))}
                </div>
            </div>}
            <ScoreBreakdownSection type="Rhyme" percentage={rhymeBreakdown.percentage * 100} modifiers={rhymeModifiers} showInfo={showInfo} setShowInfo={setShowInfo} />
            <ScoreBreakdownSection type="Flow" percentage={flowBreakdown.percentage * 100} modifiers={flowModifiers} showInfo={showInfo} setShowInfo={setShowInfo} />
            <ScoreBreakdownSection type="Length" percentage={lengthBreakdown.percentage * 100} modifiers={lengthModifiers} showInfo={showInfo} setShowInfo={setShowInfo} />
            <ScoreBreakdownSection type="Speed" percentage={speedBreakdown.percentage * 100} modifiers={speedModifiers} showInfo={showInfo} setShowInfo={setShowInfo} />
        </div>
    );
};

export default ScoreBreakdownView;