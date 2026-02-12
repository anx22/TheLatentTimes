
export const BANNED_WORDS = [
    "delve", "landscape", "tapestry", "bustling", "game-changer", "revolution", 
    "paradigm shift", "realm", "comprehensive", "utilize", "leverage", "cutting-edge",
    "transformative", "digital age", "fast-paced", "unlock", "unleash"
];

export const STYLE_INSTRUCTION = `
    STYLE GUIDE (STRICT):
    - SENTENCE LENGTH: Vary wildly. Short. Then very long and complex. Then short.
    - VOCABULARY: Use high-status, precise words (e.g., 'Simulacrum', 'Substrate', 'Latency', 'Hegemony', 'Weights', 'Inference').
    - NO EXCLAMATION POINTS.
    - NO RHETORICAL QUESTIONS.
    - AESTHETIC: 'High-Gloss / Dark Ops'. Technical but beautiful.
`;

export const getBannedList = (override?: string) => {
    if (!override) return BANNED_WORDS.join(', ');
    return `${BANNED_WORDS.join(', ')}, ${override}`;
};
