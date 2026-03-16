import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateRankings } from '../logic/scoring';

const TournamentContext = createContext();

const DEFAULT_DATA = {
    events: [
        { id: 1, name: "Event 1 - Sprint", type: "Individual" },
        { id: 2, name: "Event 2 - Relay", type: "Team" },
        { id: 3, name: "Event 3 - Long Jump", type: "Individual" },
        { id: 4, name: "Event 4 - Tug of War", type: "Team" },
        { id: 5, name: "Event 5 - Obstacle Run", type: "Individual" }
    ],
    participants: []
};

export const TournamentProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('tournament_data');
        return saved ? JSON.parse(saved) : DEFAULT_DATA;
    });

    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('is_admin') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('tournament_data', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        localStorage.setItem('is_admin', isAdmin);
    }, [isAdmin]);

    const updateRankings = () => {
        setData(prev => {
            const updatedParticipants = calculateRankings(prev.participants, prev.events);
            return { ...prev, participants: updatedParticipants };
        });
    };

    const login = (password) => {
        if (password === 'admin123') { // Simple check as per original
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
    };

    const addParticipant = (participant) => {
        setData(prev => {
            const teamCount = prev.participants.filter(p => p.type === 'Team').length;
            const individualCount = prev.participants.filter(p => p.type === 'Individual').length;

            if (participant.type === 'Team' && teamCount >= 5) {
                alert("Maximum of 5 teams allowed.");
                return prev;
            }
            if (participant.type === 'Individual' && individualCount >= 20) {
                alert("Maximum of 20 individual participants allowed.");
                return prev;
            }

            const newParticipants = [...prev.participants, participant];
            return { ...prev, participants: calculateRankings(newParticipants, prev.events) };
        });
    };

    const updateParticipant = (index, updatedParticipant) => {
        setData(prev => {
            const newParticipants = [...prev.participants];
            
            // If changing type, check limits
            if (newParticipants[index].type !== updatedParticipant.type) {
                const teamCount = prev.participants.filter(p => p.type === 'Team').length;
                const individualCount = prev.participants.filter(p => p.type === 'Individual').length;

                if (updatedParticipant.type === 'Team' && teamCount >= 5) {
                    alert("Maximum of 5 teams allowed.");
                    return prev;
                }
                if (updatedParticipant.type === 'Individual' && individualCount >= 20) {
                    alert("Maximum of 20 individual participants allowed.");
                    return prev;
                }
            }

            newParticipants[index] = updatedParticipant;
            return { ...prev, participants: calculateRankings(newParticipants, prev.events) };
        });
    };

    const deleteParticipant = (index) => {
        setData(prev => {
            const newParticipants = prev.participants.filter((_, i) => i !== index);
            return { ...prev, participants: calculateRankings(newParticipants, prev.events) };
        });
    };

    const addEvent = (event) => {
        setData(prev => {
            if (prev.events.length >= 5) {
                alert("Only 5 events allowed.");
                return prev;
            }
            const newEvents = [...prev.events, event];
            return { ...prev, events: newEvents };
        });
    };

    const updateEvent = (id, updatedEvent) => {
        setData(prev => {
            const newEvents = prev.events.map(ev => ev.id === id ? updatedEvent : ev);
            return { ...prev, events: newEvents };
        });
    };

    const deleteEvent = (id) => {
        setData(prev => {
            const newEvents = prev.events.filter(ev => ev.id !== id);
            return { ...prev, events: newEvents };
        });
    };

    const recordScore = (participantIndex, eventIdx, score) => {
        // Validation: Position must be at least 1
        if (score !== null && score < 1) return;

        setData(prev => {
            const newParticipants = [...prev.participants];
            if (!newParticipants[participantIndex].scores) {
                newParticipants[participantIndex].scores = Array(prev.events.length).fill(null);
            }
            newParticipants[participantIndex].scores[eventIdx] = score;
            return { ...prev, participants: calculateRankings(newParticipants, prev.events) };
        });
    };

    return (
        <TournamentContext.Provider value={{
            ...data,
            isAdmin,
            login,
            logout,
            addParticipant,
            updateParticipant,
            deleteParticipant,
            addEvent,
            updateEvent,
            deleteEvent,
            recordScore,
            updateRankings
        }}>
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournament = () => useContext(TournamentContext);
