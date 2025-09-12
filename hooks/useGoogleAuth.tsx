import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getGoogleClientId } from '../lib/constants';
import type { GoogleUser } from '../lib/types';
import { logAdminEvent } from '../lib/logger';

declare global {
  interface Window { google: any; }
}

interface GoogleAuthContextType {
  user: GoogleUser | null;
  handleSignOut: () => void;
  isConfigured: boolean;
  isInitialized: boolean;
  authError: string | null;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const handleCredentialResponse = useCallback((response: any) => {
        try {
            const userObject = jwtDecode<GoogleUser>(response.credential);
            setUser(userObject);
            sessionStorage.setItem('google_user', JSON.stringify(userObject));
            logAdminEvent('User Signed In', userObject.email, `Name: ${userObject.name}`);
        } catch (error) {
            console.error("Error decoding JWT:", error);
            setAuthError('Error decoding user information.');
        }
    }, []);

    const handleSignOut = useCallback(() => {
        logAdminEvent('User Signed Out', user?.email || 'Unknown');
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUser(null);
        sessionStorage.removeItem('google_user');
    }, [user]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('google_user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } 
            catch { sessionStorage.removeItem('google_user'); }
        }

        const GOOGLE_CLIENT_ID = getGoogleClientId();
        const isSignInConfigured = !!(GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID'));
        setIsConfigured(isSignInConfigured);
    }, []);

    useEffect(() => {
        if (!isConfigured || isInitialized) return;
        
        const GOOGLE_CLIENT_ID = getGoogleClientId()!;

        const initialize = () => {
             if (!window.google?.accounts?.id) {
                console.error("Google Identity Services library not loaded.");
                setAuthError("Google Sign-In script not loaded.");
                return;
            }
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });
                setIsInitialized(true);
                if (!sessionStorage.getItem('google_user')) {
                    window.google.accounts.id.prompt();
                }
            } catch (e) {
                console.error("Google Sign-In initialization error:", e);
                setAuthError(e instanceof Error ? e.message : "An unknown error occurred during Google Sign-In setup.");
            }
        };

        if (window.google) {
            initialize();
        } else {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.addEventListener('load', initialize);
                return () => script.removeEventListener('load', initialize);
            }
        }
    }, [isConfigured, isInitialized, handleCredentialResponse]);

    const value = { user, handleSignOut, isConfigured, isInitialized, authError };

    return (
        <GoogleAuthContext.Provider value={value}>
            {children}
        </GoogleAuthContext.Provider>
    );
};

export const useGoogleAuth = (): GoogleAuthContextType => {
    const context = useContext(GoogleAuthContext);
    if (context === undefined) {
        throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
    }
    return context;
};
