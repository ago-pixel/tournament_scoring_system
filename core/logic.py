from core.data import db  # type: ignore # pyre-ignore[21]

POINTS_SCHEME = {1: 10, 2: 7, 3: 5, 4: 3, 5: 1}

def calculate_rankings():
    """Calculates points and rankings just like the console version."""
    participants: list = db.get_participants()
    if not participants:
        return []

    num_events = len(db.get_events())

    # Ensure everyone has correct slots
    for p in participants:
        scores = p.get("scores", [])
        if len(scores) < num_events:
            p["scores"] = scores + [None] * (num_events - len(scores))

    # Calculate per-event points using raw scores (FR9 handling ties)
    for event_idx in range(num_events):
        event_entries = []
        for i, p in enumerate(participants):
            score = p["scores"][event_idx]
            if isinstance(score, int) and score > 0:
                event_entries.append((i, score))
        
        if not event_entries:
            continue
            
        # Top raw score first
        event_entries.sort(key=lambda x: x[1], reverse=True)

        rank = 1
        for pos, (pi, raw_score) in enumerate(event_entries):
            if pos > 0 and raw_score == event_entries[pos - 1][1]:
                pass # Tie: same rank as previous
            else:
                rank = pos + 1
            pts_key = "_event_points_" + str(event_idx)
            participants[pi][pts_key] = POINTS_SCHEME.get(rank, 0)

    # Sum totals
    for p in participants:
        total = 0
        for event_idx in range(num_events):
            total += p.get(f"_event_points_{event_idx}", 0)
        p["total"] = total

    # Sort by total points
    participants.sort(key=lambda p: p.get("total", 0), reverse=True)

    # Final rank positions
    rank = 1
    for i, p in enumerate(participants):
        if i > 0 and p.get("total", 0) == participants[i - 1].get("total", 0):
            p["rank"] = participants[i - 1].get("rank", 1)  # Tie handling
        else:
            p["rank"] = rank
        rank = i + 2

    # Save to db
    db.data["participants"] = participants
    db.save_all()
    return participants
