
import { ToneProfile } from "../../../types";

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

export const formatToneInstruction = (profile?: ToneProfile): string => {
    if (!profile) return "TONE: Standard Editorial. Neutral but sharp.";

    let dramaInst = "";
    if (profile.drama >= 4) dramaInst = "Use high-stakes framing, existential threats, and intense emotional resonance.";
    else if (profile.drama <= 1) dramaInst = "Absolute clinical detachment. Zero emotion.";

    let precisionInst = "";
    if (profile.precision >= 4) precisionInst = "Use specific numbers, technical jargon, and citations only. No fluff.";
    else if (profile.precision <= 2) precisionInst = "Focus on the 'vibe' and general feeling rather than exact specs.";

    let metaphorInst = "";
    if (profile.metaphor_density >= 4) metaphorInst = "Heavy usage of abstract metaphors (biological, physics, architectural).";
    else if (profile.metaphor_density <= 1) metaphorInst = "Literal descriptions only. No similes.";

    let adjInst = "";
    if (profile.adjective_budget > 70) adjInst = "Flowery, descriptive, baroque descriptions.";
    else if (profile.adjective_budget < 20) adjInst = "Hemingway mode. Nouns and Verbs only. Kill adjectives.";

    return `
    TONE PROFILE TARGETS:
    - DRAMA (${profile.drama}/5): ${dramaInst}
    - PRECISION (${profile.precision}/5): ${precisionInst}
    - METAPHOR (${profile.metaphor_density}/5): ${metaphorInst}
    - ADJECTIVES: ${adjInst}
    - RHYTHM: ${profile.sentence_mode} (If 'TIGHT', mostly <10 words. If 'LONG', Proustian sentences).
    `;
};
