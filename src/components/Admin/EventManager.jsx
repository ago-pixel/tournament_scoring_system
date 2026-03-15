import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';

const EventManager = ({ onBack }) => {
    const { events, addEvent, deleteEvent } = useTournament();
    const [name, setName] = useState('');
    const [type, setType] = useState('Individual');

    const handleSubmit = (e) => {
        e.preventDefault();
        const newId = events.length > 0 ? Math.max(...events.map(ev => ev.id)) + 1 : 1;
        addEvent({ id: newId, name, type });
        setName('');
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                 <button onClick={onBack} className="btn btn-outline">← Back</button>
                 <h2 style={{ fontSize: '1.8rem' }}>Manage Events</h2>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Add New Event</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Event Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. 100m Sprint" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Event Type</label>
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
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                            Add Event
                        </button>
                    </form>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Current Events</h3>
                    <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '0.5rem' }}>ID</th>
                                    <th style={{ padding: '0.5rem' }}>NAME</th>
                                    <th style={{ padding: '0.5rem' }}>TYPE</th>
                                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((ev, i) => (
                                    <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>{ev.id}</td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>{ev.name}</td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>
                                            <span className={`badge ${ev.type === 'Team' ? 'badge-team' : 'badge-indiv'}`}>
                                                {ev.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>
                                            <button onClick={() => deleteEvent(ev.id)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#ef4444' }}>Delete</button>
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

export default EventManager;
