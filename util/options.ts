import { Difficulty } from '@/types/difficulty';

export const getDifficultyOptions = (newDifficulty: Difficulty) => {
    const baseOptions = [
        {
            value: 'easy' as Difficulty,
            name: 'Easy',
            icon: '/Easy.svg',
            description: 'Good for beginners or for maximizing rhymes.',
            iconProps: { width: 24, height: 14.744, mdWidth: 40, mdHeight: 24.57, className: 'mr-[10px]' }
        },
        {
            value: 'medium' as Difficulty,
            name: 'Medium',
            icon: '/Medium.svg',
            description: 'Little bit of a challenge to push your limit.',
            iconProps: { width: 24, height: 14.406, mdWidth: 40, mdHeight: 24.01, className: 'mr-[10px]' }
        },
        {
            value: 'hard' as Difficulty,
            name: 'Hard',
            icon: '/Hard.svg',
            description: 'Some of the most difficult words to rhyme with.',
            iconProps: { width: 24, height: 15.78, mdWidth: 40, mdHeight: 26.3, className: 'mr-[10px]' }
        }
    ];

    if (newDifficulty === 'zbra-easy') {
        baseOptions.push({
            value: 'zbra-easy' as Difficulty,
            name: 'ZBRA Easy',
            icon: '/icons/ZBRAEasy.svg',
            description: "Good for beginner Zbra's so they can finally reach 500 pts maybe.",
            iconProps: { width: 24, height: 14.744, mdWidth: 40, mdHeight: 24.57, className: 'mr-[10px]' }
        });
    }

    if (newDifficulty === 'zbra-hard') {
        baseOptions.push({
            value: 'zbra-hard' as Difficulty,
            name: 'ZBRA Hard',
            icon: '/icons/ZBRAHard.svg',
            description: "Very difficult, only for the trained zbra's, not just any zbra.",
            iconProps: { width: 24, height: 15.78, mdWidth: 40, mdHeight: 26.3, className: 'mr-[10px]' }
        });
    }

    return baseOptions;
};

export const gameModeOptions = [
    {
        value: '4-Bar Mode',
        name: '4-Bar Mode',
        icon: '/icons/FourBarMode.svg',
        description: 'Write 4 sentences that rhyme with the keyword within the time limit.',
        iconProps: { width: 16, height: 16, mdWidth: 23, mdHeight: 24, className: 'mr-[10px]' }
    },
    {
        value: 'Endless Mode',
        name: 'Endless Mode',
        icon: '/icons/EndlessMode.svg',
        description: 'Write as many sentences as possible that rhyme with the keyword within the time limit. Each rhyme resets the timer.',
        iconProps: { width: 16, height: 16, mdWidth: 25.15, mdHeight: 12.15, className: 'mr-[10px]' }
    },
    {
        value: 'Rapid Fire Mode',
        name: 'Rapid Fire Mode',
        icon: '/icons/RapidFireMode.svg',
        description: 'Write 2 sentences that rhyme with each keyword. Complete as many keywords as you can within the time limit.',
        disabled: true,
        iconProps: { width: 16, height: 16, mdWidth: 21.6, mdHeight: 27, className: 'mr-[10px]' }
    }
];


