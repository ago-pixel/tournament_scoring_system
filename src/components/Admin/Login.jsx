import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';

const Login = () => {
    const { login } = useTournament();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(password)) {
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Portal</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Admin Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password..."
                            style={{ borderColor: error ? '#ef4444' : 'var(--glass-border)' }}
                        />
                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>Invalid password</p>}
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
