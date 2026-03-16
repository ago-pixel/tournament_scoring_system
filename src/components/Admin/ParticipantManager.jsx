import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';

const ParticipantManager = ({ onBack }) => {
    const { participants, addParticipant, updateParticipant, deleteParticipant } = useTournament();
    const [name, setName] = useState('');
    const [type, setType] = useState('Individual');
    const [team, setTeam] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    const teamCount = participants.filter(p => p.type === 'Team').length;
    const individualCount = participants.filter(p => p.type === 'Individual').length;
    const isTeamLimitReached = type === 'Team' && teamCount >= 5 && editingIndex === null;
    const isIndivLimitReached = type === 'Individual' && individualCount >= 20 && editingIndex === null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isTeamLimitReached || isIndivLimitReached) return;

        const participant = { name, type, team: type === 'Team' ? team : null, scores: editingIndex !== null ? participants[editingIndex].scores : [] };
        
        if (editingIndex !== null) {
            updateParticipant(editingIndex, participant);
            setEditingIndex(null);
        } else {
            addParticipant(participant);
        }
        
        setName('');
        setTeam('');
        setType('Individual');
    };

    const handleEdit = (index) => {
        const p = participants[index];
        setName(p.name);
        setType(p.type);
        setTeam(p.team || '');
        setEditingIndex(index);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                 <button onClick={onBack} className="btn btn-outline">← Back</button>
                 <h2 style={{ fontSize: '1.8rem' }}>Manage Participants</h2>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{editingIndex !== null ? 'Edit' : 'Add'} Participant</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Participant Name" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)}
                                style={{
                                    width: '100%', 
                                    padding: '12px', 
                                    background: 'rgba(15, 23, 42, 0.6)', 
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            >
                                <option value="Individual">Individual</option>
                                <option value="Team">Team</option>
                            </select>
                        </div>
                        {type === 'Team' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Team Name/ID</label>
                                <input value={team} onChange={(e) => setTeam(e.target.value)} required placeholder="e.g. A, B, Dragons" />
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Teams: {teamCount}/5</span>
                            <span>Individuals: {individualCount}/20</span>
                        </div>
                        
                        {(isTeamLimitReached || isIndivLimitReached) && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                                Limit reached for {type}s.
                            </p>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ marginTop: '0.5rem', justifyContent: 'center' }}
                            disabled={isTeamLimitReached || isIndivLimitReached}
                        >
                            {editingIndex !== null ? 'Update' : 'Add'} Participant
                        </button>
                        {editingIndex !== null && (
                             <button type="button" onClick={() => { setEditingIndex(null); setName(''); setTeam(''); }} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Current Participants</h3>
                    <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '0.5rem' }}>NAME</th>
                                    <th style={{ padding: '0.5rem' }}>TYPE</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>
                                            {p.name} {p.team && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({p.team})</span>}
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>
                                            <span className={`badge ${p.type === 'Team' ? 'badge-team' : 'badge-indiv'}`}>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>
                                            <button onClick={() => handleEdit(i)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', marginRight: '5px' }}>Edit</button>
                                            <button onClick={() => deleteParticipant(i)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#ef4444' }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantManager;
