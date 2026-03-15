const POINTS_SCHEME = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 1 };

/**
 * Calculates points and rankings based on the same rules as the Python version.
 * @param {Array} participants - List of participant objects.
 * @param {Array} events - List of event objects.
 * @returns {Array} - The updated and sorted list of participants.
 */
export function calculateRankings(participants, events) {
    if (!participants || participants.length === 0) return [];
    if (!events || events.length === 0) return participants;

    const numEvents = events.length;

    // Deep clone to avoid mutating the original state directly (React-friendly)
    const updatedParticipants = JSON.parse(JSON.stringify(participants));

    // Ensure everyone has correct slots
    updatedParticipants.forEach(p => {
        if (!p.scores) p.scores = [];
        while (p.scores.length < numEvents) {
            p.scores.push(null);
        }
    });

    // Calculate per-event points using raw scores
    for (let eventIdx = 0; eventIdx < numEvents; eventIdx++) {
        const eventEntries = [];
        updatedParticipants.forEach((p, i) => {
            const score = p.scores[eventIdx];
            if (typeof score === 'number' && score > 0) {
                eventEntries.push({ index: i, score: score });
            }
        });

        if (eventEntries.length === 0) continue;

        // Sort by raw score descending
        eventEntries.sort((a, b) => b.score - a.score);

        let rank = 1;
        eventEntries.forEach((entry, pos) => {
            if (pos > 0 && entry.score === eventEntries[pos - 1].score) {
                // Tie: same rank as previous
            } else {
                rank = pos + 1;
            }
            updatedParticipants[entry.index][`_event_points_${eventIdx}`] = POINTS_SCHEME[rank] || 0;
        });
    }

    // Sum totals
    updatedParticipants.forEach(p => {
        let total = 0;
        for (let eventIdx = 0; eventIdx < numEvents; eventIdx++) {
            total += p[`_event_points_${eventIdx}`] || 0;
        }
        p.total = total;
    });

    // Sort by total points descending
    updatedParticipants.sort((a, b) => (b.total || 0) - (a.total || 0));

    // Final rank positions
    let currentRank = 1;
    updatedParticipants.forEach((p, i) => {
        if (i > 0 && p.total === updatedParticipants[i - 1].total) {
            p.rank = updatedParticipants[i - 1].rank;
        } else {
            p.rank = currentRank;
        }
        currentRank = i + 2;
    });

    return updatedParticipants;
}
