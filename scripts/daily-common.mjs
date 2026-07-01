import fs from 'node:fs';
import path from 'node:path';
import nlp from 'compromise';
import postgres from 'postgres';

export const WORD_FREQ_URL =
  'https://raw.githubusercontent.com/aparrish/wordfreq-en-25000/master/wordfreq-en-25000-log.json';

export const DAILY_START_DATE = '2026-06-30';
export const DAILY_TARGET_COUNT = 10000;
export const DAILY_INTERNAL_DIFFICULTY = 'medium';
export const DAILY_MIN_STRONG_RHYMES = 2;
export const DAILY_MIN_TOTAL_USABLE_RHYMES = 5;
export const DAILY_STRONG_RHYME_CELL_CAP = 20;

export const FUNCTION_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'just',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
]);

export const BLOCKED_WORDS = new Set([
  // Daily target words should stay broadly shareable and non-explicit.
  'arab',
  'argentina',
  'asian',
  'broadway',
  'buddhist',
  'cancer',
  'christian',
  'christina',
  'ebay',
  'fridays',
  'acm',
  'ahh',
  'als',
  'ang',
  'app',
  'ata',
  'atm',
  'bah',
  'bal',
  'bbq',
  'bis',
  'bom',
  'bon',
  'cao',
  'ceo',
  'cha',
  'com',
  'cos',
  'dal',
  'der',
  'des',
  'dis',
  'dna',
  'dom',
  'dos',
  'edo',
  'fag',
  'han',
  'hah',
  'hoc',
  'ich',
  'ifs',
  'ish',
  'lac',
  'lam',
  'lan',
  'lbs',
  'lil',
  'lim',
  'lol',
  'los',
  'mao',
  'mgm',
  'mis',
  'moi',
  'mos',
  'nam',
  'nan',
  'nom',
  'ons',
  'ost',
  'ova',
  'pac',
  'pap',
  'pas',
  'paz',
  'pee',
  'pol',
  'poop',
  'ppm',
  'raf',
  'rao',
  'ras',
  'rec',
  'roi',
  'rom',
  'ros',
  'rpm',
  'rus',
  'sao',
  'sas',
  'sec',
  'sha',
  'som',
  'sox',
  'sur',
  'sus',
  'ter',
  'tho',
  'tis',
  'tit',
  'und',
  'usb',
  'vis',
  'wah',
  'wal',
  'wat',
  'www',
  'yah',
  'yer',
  'gay',
  'gina',
  'grace',
  'greenland',
  'harry',
  'hindu',
  'jerry',
  'jewish',
  'jews',
  'katrina',
  'larry',
  'lena',
  'luis',
  'madman',
  'mark',
  'matt',
  'mondays',
  'muslim',
  'perry',
  'portuguese',
  'rabbi',
  'sandra',
  'saturdays',
  'scott',
  'serena',
  'suicide',
  'sundays',
  'terry',
  'thailand',
  'thursdays',
  'tina',
  'tuesdays',
  'wednesdays',
  'yahoo',
  'abc',
  'aden',
  'adidas',
  'admin',
  'anal',
  'anus',
  'amazon',
  'america',
  'american',
  'android',
  'api',
  'april',
  'apple',
  'apps',
  'ass',
  'baden',
  'asshole',
  'august',
  'austin',
  'bbc',
  'biden',
  'billy',
  'bobby',
  'boston',
  'brandon',
  'brian',
  'california',
  'canada',
  'cas',
  'cbs',
  'chicago',
  'china',
  'chinese',
  'cia',
  'clayton',
  'cnn',
  'css',
  'dallas',
  'das',
  'dat',
  'david',
  'dayton',
  'december',
  'dex',
  'disney',
  'dmv',
  'docs',
  'dvd',
  'bastard',
  'bitch',
  'boob',
  'boobs',
  'bordello',
  'brothel',
  'cock',
  'coke',
  'cum',
  'cunt',
  'dick',
  'dildo',
  'england',
  'erotic',
  'erotica',
  'est',
  'eu',
  'facebook',
  'feb',
  'february',
  'fetish',
  'fbi',
  'florida',
  'france',
  'french',
  'friday',
  'fuck',
  'fucked',
  'fucker',
  'fucking',
  'german',
  'germany',
  'gps',
  'grayson',
  'google',
  'hayden',
  'html',
  'hooker',
  'http',
  'https',
  'ios',
  'iraq',
  'iran',
  'irs',
  'israel',
  'italy',
  'james',
  'january',
  'japan',
  'japanese',
  'jason',
  'joe',
  'john',
  'july',
  'june',
  'karen',
  'kat',
  'kelly',
  'kevin',
  'las',
  'lee',
  'lex',
  'lisa',
  'login',
  'london',
  'mac',
  'incest',
  'instagram',
  'iphone',
  'maria',
  'mason',
  'masturbate',
  'mary',
  'megan',
  'mexico',
  'michael',
  'microsoft',
  'miami',
  'mlb',
  'monday',
  'moscow',
  'nat',
  'nasa',
  'nba',
  'nbc',
  'netflix',
  'nfl',
  'nhl',
  'nike',
  'norway',
  'november',
  'nude',
  'nudity',
  'october',
  'orgasm',
  'paris',
  'pc',
  'penis',
  'pepsi',
  'peyton',
  'pimp',
  'playstation',
  'porn',
  'porno',
  'pdf',
  'prostitute',
  'prostitution',
  'pussy',
  'rape',
  'rapist',
  'reagan',
  'reddit',
  'rex',
  'russia',
  'russian',
  'sarah',
  'samsung',
  'saturday',
  'sas',
  'seattle',
  'seo',
  'semen',
  'september',
  'sex',
  'sexual',
  'sexy',
  'shit',
  'sql',
  'steven',
  'slut',
  'sperm',
  'spain',
  'spotify',
  'stripper',
  'stripping',
  'sunday',
  'susan',
  'tesla',
  'tex',
  'texas',
  'thursday',
  'tits',
  'tiktok',
  'tokyo',
  'tommy',
  'tony',
  'tuesday',
  'tv',
  'twitter',
  'turk',
  'uk',
  'usa',
  'vagina',
  'vegas',
  'viva',
  'walmart',
  'wednesday',
  'wendy',
  'whore',
  'www',
  'xbox',
  'york',
  'youtube',
]);

export function loadEnvFile(filePath = '.env.local') {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    return;
  }

  for (const line of fs.readFileSync(resolvedPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    let value = trimmed.slice(separatorIndex + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

export function createSql() {
  loadEnvFile();
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }
  return postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 });
}

export function normalizeWord(word) {
  return String(word).toLowerCase().trim();
}

export function getBaseExclusionReason(word) {
  const normalized = normalizeWord(word);

  if (!/^[a-z]+$/.test(normalized)) {
    return 'invalid-token-shape';
  }

  if (normalized.length < 3) {
    return 'too-short';
  }

  if (normalized.length > 12) {
    return 'too-long';
  }

  if (FUNCTION_WORDS.has(normalized)) {
    return 'function-word';
  }

  if (BLOCKED_WORDS.has(normalized)) {
    return 'blocked-word';
  }

  const nlpExclusionReason = getNlpExclusionReason(normalized);
  if (nlpExclusionReason) {
    return nlpExclusionReason;
  }

  return null;
}

export function getNlpExclusionReason(word) {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return null;
  }

  const titleCased = `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
  const tags = new Set(nlp(titleCased).json()[0]?.terms?.[0]?.tags ?? []);

  if (tags.has('Month') || tags.has('WeekDay')) {
    return 'calendar-word';
  }

  if (tags.has('Person') || tags.has('FirstName')) {
    return 'proper-name';
  }

  if (
    tags.has('Place') ||
    tags.has('Country') ||
    tags.has('Organization') ||
    tags.has('Demonym')
  ) {
    return 'proper-noun';
  }

  return null;
}

export function hasStressMarker(pronunciation) {
  return typeof pronunciation === 'string' && /[012]/.test(pronunciation);
}

export function isDailyEligible(row) {
  return Boolean(
    !row.daily_exclusion_reason &&
      row.pronunciation &&
      row.has_stress_marker &&
      Number(row.perfect_rhyme_count) >= DAILY_MIN_STRONG_RHYMES &&
      Number(row.total_usable_rhyme_count) >= DAILY_MIN_TOTAL_USABLE_RHYMES,
  );
}

export function getRhymabilityScore(row) {
  return (
    Math.min(
      Number(row.perfect_rhyme_count ?? 0),
      DAILY_STRONG_RHYME_CELL_CAP,
    ) *
      2 +
    Number(row.near_rhyme_count ?? 0) +
    Math.floor(Number(row.rhymescore ?? 0) / 1000)
  );
}

export async function fetchJsonWithRetry(url, attempts = 3, timeoutMs = 8000) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        return await response.json();
      }
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 350));
  }

  throw lastError;
}
