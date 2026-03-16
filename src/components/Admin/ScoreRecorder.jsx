import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';

const ScoreRecorder = ({ onManageParticipants, onManageEvents }) => {
    const { participants, events, recordScore } = useTournament();
    const [selectedEventIdx, setSelectedEventIdx] = useState(0);
    const [localScores, setLocalScores] = useState({});

    // Initialize local scores when event changes or participants update
    useEffect(() => {
        const initial = {};
        participants.forEach((p, i) => {
            initial[i] = p.scores && p.scores[selectedEventIdx] !== null ? p.scores[selectedEventIdx] : '';
        });
        setLocalScores(initial);
    }, [selectedEventIdx, participants]);

    const handleLocalChange = (participantIdx, value) => {
        setLocalScores(prev => ({ ...prev, [participantIdx]: value }));
    };

    const handleSubmit = () => {
        // Bulk record scores
        participants.forEach((p, i) => {
            const val = localScores[i];
            if (val === '') {
                recordScore(i, selectedEventIdx, null);
            } else {
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                    recordScore(i, selectedEventIdx, num);
                }
            }
        });
        alert('Scores submitted successfully!');
    };

    const currentEvent = events[selectedEventIdx];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                 <h2 style={{ fontSize: '1.8rem' }}>Admin Dashboard</h2>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onManageParticipants} className="btn btn-outline">Manage Participants</button>
                    <button onClick={onManageEvents} className="btn btn-outline">Manage Events</button>
                 </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ whiteSpace: 'nowrap' }}>Record Positions for:</h3>
                    <select 
                        value={selectedEventIdx} 
                        onChange={(e) => setSelectedEventIdx(parseInt(e.target.value))}
                        style={{
                            padding: '10px', 
                            background: 'rgba(15, 23, 42, 0.6)', 
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            flexGrow: 1,
                            minWidth: '200px'
                        }}
                    >
                        {events.map((ev, i) => (
                            <option key={ev.id} value={i}>{ev.name} ({ev.type})</option>
                        ))}
                    </select>
                    <button onClick={handleSubmit} className="btn btn-primary">
                        Submit All Positions
                    </button>
                </div>

                {events.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No events created yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem' }}>PARTICIPANT</th>
                                    <th style={{ padding: '1rem' }}>TYPE</th>
                                    <th style={{ padding: '1rem', width: '150px' }}>POSITION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => {
                                    // Filter participants by event type (optional, but keep simple for now)
                                    // if (p.type !== currentEvent.type) return null;
                                    
                                    const scoreValue = p.scores && p.scores[selectedEventIdx] !== null ? p.scores[selectedEventIdx] : '';
                                    
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {p.name} {p.team && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({p.team})</span>}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge ${p.type === 'Team' ? 'badge-team' : 'badge-indiv'}`}>
                                                    {p.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <input 
                                                    type="number" 
                                                    value={localScores[i] ?? ''} 
                                                    onChange={(e) => handleLocalChange(i, e.target.value)}
                                                    placeholder="Pos"
                                                    min="1"
                                                    max={currentEvent?.type === 'Team' ? 5 : 20}
                                                    style={{ padding: '8px', fontSize: '0.9rem' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {participants.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            No participants found. Add some in the Participant Manager.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreRecorder;
