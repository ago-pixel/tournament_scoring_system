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

    // Calculate per-event points using positions
    for (let eventIdx = 0; eventIdx < numEvents; eventIdx++) {
        const eventEntries = [];
        updatedParticipants.forEach((p, i) => {
            const position = p.scores[eventIdx];
            if (typeof position === 'number' && position > 0) {
                eventEntries.push({ index: i, position: position });
            }
        });

        if (eventEntries.length === 0) continue;

        const N = eventEntries.length;

        // Calculate points based on position (P)
        // Formula: Score = 100 * (N - P) / (N - 1)
        eventEntries.forEach((entry) => {
            const P = entry.position;
            let points = 0;
            if (N > 1) {
                points = Math.round(100 * (N - P) / (N - 1));
            } else {
                points = 100; // Only one participant
            }
            
            // Ensure points are within 0-100 range
            updatedParticipants[entry.index][`_event_points_${eventIdx}`] = Math.max(0, Math.min(100, points));
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
