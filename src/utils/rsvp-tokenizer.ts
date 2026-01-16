// src/utils/rsvp-tokenizer.ts

export type RsvpMode = 'clean' | 'pure';

export type RsvpToken = {
    raw: string; // original token from split
    text: string; // what you display
    extraPauseMs: number; // extra pause after this token (clean mode only)
};

export const DEFAULT_PAUSES_MS = {
    comma: 90,
    semicolon: 120,
    colon: 120,
    dash: 120,
    period: 180,
    exclamation: 200,
    question: 220,
    ellipsis: 260,
} as const;

export function cleanDisplayWord(raw: string): string {
    // Remove leading/trailing clutter but keep internal apostrophes: Paul's, don't
    // Keep internal hyphens (optional): state-of-the-art
    return raw
        .replace(/^[^A-Za-z0-9]+/, '')
        .replace(/[^A-Za-z0-9'.,]+$/, '')
        .replace(/^'+|'+$/g, '');
}

export function computeExtraPauseMs(raw: string): number {
    const t = raw.trim();

    // Ellipsis … or ...
    if (/[.…]$/.test(t) || /\.{3,}$/.test(t)) return DEFAULT_PAUSES_MS.ellipsis;

    // Strong sentence end
    if (/[!?]$/.test(t)) return /[?]$/.test(t) ? DEFAULT_PAUSES_MS.question : DEFAULT_PAUSES_MS.exclamation;
    if (/[.]$/.test(t)) return DEFAULT_PAUSES_MS.period;

    // Medium pause
    if (/[;]$/.test(t)) return DEFAULT_PAUSES_MS.semicolon;
    if (/[:]$/.test(t)) return DEFAULT_PAUSES_MS.colon;

    // Light pause
    if (/[,\u060C]$/.test(t)) return DEFAULT_PAUSES_MS.comma; // includes Arabic comma just in case

    // Dashes at end (— or – or -)
    if (/[—–-]$/.test(t)) return DEFAULT_PAUSES_MS.dash;

    return 0;
}

export function tokenizeRsvp(content: string, mode: RsvpMode = 'clean'): RsvpToken[] {
    const rawTokens = content.split(/\s+/);

    return rawTokens
        .map((raw): RsvpToken => {
            const text = cleanDisplayWord(raw);
            const extraPauseMs = mode === 'clean' ? computeExtraPauseMs(raw) : 0;
            return { raw, text, extraPauseMs };
        })
        .filter(t => t.text.length > 0); // skip tokens that become empty after cleaning
}
