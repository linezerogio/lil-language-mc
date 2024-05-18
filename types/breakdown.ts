class RhymeBreakdown {
    endedWithPunchline: boolean;
    perfectRhymes: number;
    nearRhymes: number;
    typos: number;
    repeatedWords: number;
    percentage: number;

    constructor() {
        this.endedWithPunchline = false;
        this.perfectRhymes = 0;
        this.nearRhymes = 0;
        this.typos = 0;
        this.repeatedWords = 0;
        this.percentage = 0;
    }
}

class FlowBreakdown {
    syllableMatch: number;
    rhymePlacement: number;
    syllableDifference: number;
    percentage: number;

    constructor() {
        this.syllableMatch = 0;
        this.rhymePlacement = 0;
        this.syllableDifference = 0;
        this.percentage = 0;
    }
}

class LengthBreakdown {
    longSentences: number;
    midSentences: number;
    shortSentences: number;
    percentage: number;

    constructor() {
        this.longSentences = 0;
        this.midSentences = 0;
        this.shortSentences = 0;
        this.percentage = 0;
    }
}

class SpeedBreakdown {
    timeRemaining: number;
    ranOutOfTime: boolean;
    percentage: number;

    constructor() {
        this.timeRemaining = 0;
        this.ranOutOfTime = false;
        this.percentage = 0;
    }
}

class ScoreBreakdown {
    rhymeBreakdown: RhymeBreakdown;
    flowBreakdown: FlowBreakdown;
    lengthBreakdown: LengthBreakdown;
    speedBreakdown: SpeedBreakdown;

    constructor() {
        this.rhymeBreakdown = new RhymeBreakdown();
        this.flowBreakdown = new FlowBreakdown();
        this.lengthBreakdown = new LengthBreakdown();
        this.speedBreakdown = new SpeedBreakdown();
    }
}

export default ScoreBreakdown;