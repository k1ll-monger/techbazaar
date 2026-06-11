import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    //context doesn't persist between page refreshes.
    //  When you refresh the page or open a new tab, React starts fresh and user in context resets to null 
    // — even though your session cookie still exists in the browser.

    //So the session is alive on the backend, but the frontend lost the user object. 
    // The /auth/me route fix I gave you solves exactly this — on every app load (the UserProvider will mount on App) it checks if a 
    // session exists and restores the user to context.

    // as soon as UserProvider mounts, it checks for an existing session automatically!
    useEffect(() => {
        async function checkSession() {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
            } catch(e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}