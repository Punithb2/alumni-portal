import { useState, useEffect } from 'react';
import { dummyEvents } from '../data/dummyData';

const getInitialEvents = () => {
    const enhancedDefaults = dummyEvents.map(event => ({
        ...event,
        capacity: 200,   // default capacity 
        price: event.id === 'e2' ? 15 : 0, // default price for demo
        registeredUsers: [], // Array of user objects or IDs representing RSVPs
    }));

    const saved = localStorage.getItem('mock_events');
    if (saved && saved.length > 20) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not parse saved mock_events", e);
        }
    }

    localStorage.setItem('mock_events', JSON.stringify(enhancedDefaults));
    return enhancedDefaults;
};

export const useEvents = () => {
    const [events, setEvents] = useState(getInitialEvents);

    useEffect(() => {
        localStorage.setItem('mock_events', JSON.stringify(events));
    }, [events]);

    const addEvent = (data) => {
        const newEvent = {
            ...data,
            id: `e_${Date.now()}`,
            attendees: 0,
            registeredUsers: [],
        };
        setEvents(prev => [newEvent, ...prev]);
        return newEvent;
    };

    const updateEvent = (id, data) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    };

    const deleteEvent = (id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const registerUser = (eventId, user) => {
        setEvents(prev => prev.map(e => {
            if (e.id === eventId) {
                // Prevent duplicate registration in this mock scenario
                if (e.registeredUsers.some(u => u.id === user.id)) {
                    return e;
                }
                return {
                    ...e,
                    attendees: e.attendees + 1,
                    registeredUsers: [...e.registeredUsers, user]
                };
            }
            return e;
        }));
    };

    return {
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        registerUser,
        getEventById: (id) => events.find(e => e.id === id)
    };
};
