import postgres from 'postgres';
import { DIFFICULTY_SETTINGS } from '@/util/settings';

export type Word = {
    id: number;
    word: string;
    pronunciation: string;
    rhymescore: number;
}

export type RZWord = {
    word: string;
    score: number;
    numSyllables: number;
    tags: string[];
    defs: string[];
}

export async function getPronunciation(word: string) {
    if (word == "") {
        return;
    }

    const res = await fetch(`https://api.datamuse.com/words?sp=${word}&qe=sp&md=r&max=1`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const json = await res.json();
    const tags = json[0].tags;
    const pronTag = tags.find((tag: string) => tag.startsWith("pron:"));

    return pronTag?.split(":")[1];
}

export async function getPronunciations(words: string[]) {
    if (words.length < 1) {
        return [];
    }

    const wordsWithPronunciations = []

    for (const word of words) {
        const pronunciation = await getPronunciation(word);
        wordsWithPronunciations.push({
            value: word,
            pronunciation
        })
    }

    if (words.length === wordsWithPronunciations.length) {
        return wordsWithPronunciations;
    }
}

export async function getRhymeScore(word: string): Promise<number> {
    if (word == "") {
        return 0;
    }

    const res = await fetch(`https://api.datamuse.com/words?sl=${word}`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const json: any[] = await res.json();

    return json.reduce(function (a, b) {
        if (a !== -1) {
            return a + b["score"]
        }
        return 0;
    }, -1);
}

export async function getRhymes(word: string, wordsToCheck: string[]): Promise<RZWord[]> {
    if (word == "") {
        return [];
    }

    const res = await fetch(`https://api.rhymezone.com/words?k=rza&arhy=1&max=1000&qe=sl&md=fpdlr&sl=${word}`);

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }

    const json: any[] = await res.json();

    return json.filter(el => {
        return wordsToCheck.includes(el.word);
    });
}

export async function importWordToDatabase(word: string) {
    if (process.env.DATABASE_URL === undefined || word == "") {
        return;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const pronunciation = await getPronunciation(word);
    const rhymeScore = await getRhymeScore(word);

    const response = await sql`INSERT INTO words (word, pronunciation, rhymescore) VALUES (${word}, ${pronunciation}, ${rhymeScore})`;

    return response;
}

export async function getWordData(word: string) {
    if (process.env.DATABASE_URL === undefined || word === "") {
        return;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const response: Word[] = await sql`SELECT * FROM words WHERE word=${word}`;

    if (response.length === 0) {
        return await importWordToDatabase(word);
    } else {
        return response;
    }
}

function thirdFromDifficulty(difficulty: "easy" | "medium" | "hard") {
    if (difficulty === "easy") {
        return 3;
    } else if (difficulty === "hard") {
        return 1;
    } else {
        return 2;
    }
}

export async function getWordByDifficulty(difficulty: "easy" | "medium" | "hard" | "zbra-easy" | "zbra-hard") {
    if (process.env.DATABASE_URL === undefined) {
        return;
    }

    if (difficulty === "zbra-hard") {
        return { id: 0, "word": "youtube", "rhymescore": 0, "pronunciation": "" } as Word;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    if (difficulty === "zbra-easy") {
        // Top decile from settings
        const { ntileSeparator } = DIFFICULTY_SETTINGS['zbra-easy'].wordSelection;
        const response: Word[] = await sql`
            WITH Percentiles AS (
                SELECT *,
                    NTILE(${ntileSeparator}) OVER (ORDER BY rhymescore DESC) AS Decile
                FROM words
            )
            SELECT *
            FROM Percentiles
            WHERE Decile = 1
            ORDER BY RANDOM()
            LIMIT 1;
        `;
        return response[0];
    } else {
        // Tertiles via settings; use DESC so Third=1 is top third
        const { ntileValue } = DIFFICULTY_SETTINGS[difficulty].wordSelection;
        const response: Word[] = await sql`
            WITH OrderedScores AS (
                SELECT *,
                    NTILE(3) OVER (ORDER BY rhymescore DESC) AS Third
                FROM words
            )
            SELECT *
            FROM OrderedScores
            WHERE Third = ${ntileValue}
            ORDER BY RANDOM()
            LIMIT 1;
        `;
        return response[0];
    }
}

export type Submission = {
    id: number;
    lines: string[];
    score: number;
    played_on: Date;
    keyword: string;
    mode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode';
    difficulty: 'easy' | 'medium' | 'hard' | 'zbra-easy' | 'zbra-hard';
};

export async function saveSubmission(
    lines: string[], 
    score: number, 
    keyword: string, 
    mode: '4-Bar Mode' | 'Rapid Fire Mode' | 'Endless Mode',
    difficulty: 'easy' | 'medium' | 'hard' | 'zbra-easy' | 'zbra-hard',
) {
    if (process.env.DATABASE_URL === undefined) {
        return;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const response = await sql`
        INSERT INTO submissions (lines, score, keyword, mode, difficulty) 
        VALUES (${lines}, ${score}, ${keyword}, ${mode}, ${difficulty})
        RETURNING id
    `;

    return response[0]?.id;
}

export async function getSubmission(id: number) {
    if (process.env.DATABASE_URL === undefined) {
        return;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const response: Submission[] = await sql`
        SELECT * FROM submissions WHERE id=${id}
    `;

    if (response.length === 0) {
        return null;
    }

    return response[0];
}

export async function getMaxSubmissionScore() {
    if (process.env.DATABASE_URL === undefined) {
        return 0;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const response: Array<{ max: number | null }> = await sql`
        SELECT MAX(score) as max FROM submissions
    `;

    return Number(response[0]?.max ?? 0);
}

export async function getMaxWordScore(word: string) {
    if (process.env.DATABASE_URL === undefined) {
        return 0;
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    const response: Array<{ max: number | null }> = await sql`
        SELECT MAX(score) as max FROM submissions WHERE keyword=${word}
    `;

    return Number(response[0]?.max ?? 0);
}