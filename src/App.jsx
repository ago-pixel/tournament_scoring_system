import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import Leaderboard from './components/Leaderboard';
import Login from './components/Admin/Login';
import ParticipantManager from './components/Admin/ParticipantManager';
import EventManager from './components/Admin/EventManager';
import ScoreRecorder from './components/Admin/ScoreRecorder';

import logo from './assets/logo.png';

const AppContent = () => {
    const { isAdmin, logout } = useTournament();
    const [view, setView] = useState('leaderboard'); // leaderboard, login, manage_participants, manage_events, record_scores

    const renderView = () => {
        if (!isAdmin && view !== 'leaderboard' && view !== 'login') {
            return <Leaderboard />;
        }

        switch (view) {
            case 'leaderboard': return <Leaderboard />;
            case 'login': return isAdmin ? setView('record_scores') || <ScoreRecorder /> : <Login />;
            case 'manage_participants': return <ParticipantManager onBack={() => setView('record_scores')} />;
            case 'manage_events': return <EventManager onBack={() => setView('record_scores')} />;
            case 'record_scores': return <ScoreRecorder onManageParticipants={() => setView('manage_participants')} onManageEvents={() => setView('manage_events')} />;
            default: return <Leaderboard />;
        }
    };

    return (
        <div className="container">
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '3rem',
                padding: '1rem 0',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logo} alt="College Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div>
                        <h1 style={{ fontSize: '1.4rem' }}>College Tournament Scoring</h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Professional Tournament Management</p>
                    </div>
                </div>

                <nav style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setView('leaderboard')} className={`btn ${view === 'leaderboard' ? 'btn-primary' : 'btn-outline'}`}>
                        Leaderboard
                    </button>
                    {!isAdmin ? (
                        <button onClick={() => setView('login')} className={`btn ${view === 'login' ? 'btn-primary' : 'btn-outline'}`}>
                            Admin Access
                        </button>
                    ) : (
                        <>
                             <button onClick={() => setView('record_scores')} className={`btn ${['record_scores', 'manage_participants', 'manage_events'].includes(view) ? 'btn-primary' : 'btn-outline'}`}>
                                Admin Dashboard
                            </button>
                            <button onClick={() => { logout(); setView('leaderboard'); }} className="btn btn-outline" style={{ color: '#ef4444' }}>
                                Logout
                            </button>
                        </>
                    )}
                </nav>
            </header>

            <main>
                {renderView()}
            </main>

            <footer style={{ marginTop: '5rem', paddingBottom: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} A.G. Osuri • College Tournament Scoring System
            </footer>
        </div>
    );
};

function App() {
    return (
        <TournamentProvider>
            <AppContent />
        </TournamentProvider>
    );
}

export default App;
