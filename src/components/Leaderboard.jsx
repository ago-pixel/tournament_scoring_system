import React from 'react';
import { useTournament } from '../context/TournamentContext';

const Leaderboard = () => {
    const { participants, events } = useTournament();

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Tournament Standings</h2>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {participants.length} Participants • {events.length} Events
                    </span>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left' }}>
                            <th style={{ padding: '0 1rem' }}>RANK</th>
                            <th style={{ padding: '0 1rem' }}>PARTICIPANT</th>
                            <th style={{ padding: '0 1rem' }}>TYPE</th>
                            <th style={{ padding: '0 1rem', textAlign: 'center' }}>TOTAL POINTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((p, i) => (
                            <tr key={i} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <td style={{ padding: '1rem', fontWeight: 700, color: p.rank <= 3 ? 'var(--accent)' : 'inherit' }}>
                                    #{p.rank}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                    {p.name} {p.team && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Team {p.team})</span>}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${p.type === 'Team' ? 'badge-team' : 'badge-indiv'}`}>
                                        {p.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                                    {p.total || 0}
                                </td>
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No results available yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
