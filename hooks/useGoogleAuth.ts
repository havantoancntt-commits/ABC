import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { GOOGLE_CLIENT_ID } from '../lib/constants';
import type { GoogleUser } from '../lib/types';
import { logAdminEvent } from '../lib/logger';

// FIX: Declare the global `google` object provided by the Google Identity Services script
// to resolve TypeScript errors about it not being defined on `window` or globally.
declare global {
  interface Window {
    google: any;
  }
}

interface UseGoogleAuthProps {
  onSuccess?: (user: GoogleUser) => void;
  onError?: () => void;
}

export const useGoogleAuth = ({ onSuccess, onError }: UseGoogleAuthProps) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleSignOut = useCallback(() => {
        logAdminEvent('User Signed Out', user?.email || 'Unknown');
        window.google.accounts.id.disableAutoSelect();
        setUser(null);
        sessionStorage.removeItem('google_user');
    }, [user]);

    const handleCredentialResponse = useCallback((response: any) => {
        try {
            const userObject = jwtDecode<GoogleUser>(response.credential);
            setUser(userObject);
            sessionStorage.setItem('google_user', JSON.stringify(userObject));
            if (onSuccess) {
                onSuccess(userObject);
            }
        } catch (error) {
            console.error("Error decoding JWT:", error);
            if (onError) {
                onError();
            }
        }
    }, [onSuccess, onError]);
    
    useEffect(() => {
        // Check for persisted user session
        const storedUser = sessionStorage.getItem('google_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                sessionStorage.removeItem('google_user');
            }
        }

        if (!GOOGLE_CLIENT_ID) {
            console.error("Google Client ID is not configured.");
            setAuthError("Google Sign-In is not configured.");
            return;
        }

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });

                const signInButton = document.getElementById('google-signin-button');
                if (signInButton) {
                    window.google.accounts.id.renderButton(
                        signInButton,
                        { theme: "outline", size: "large", type: "standard", shape: "pill" }
                    );
                }
            } else {
                console.error("Google Identity Services script not loaded.");
            }
        };

        // Ensure the Google script is loaded before initializing
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.addEventListener('load', initializeGoogleSignIn);
                return () => script.removeEventListener('load', initializeGoogleSignIn);
            }
        }

    }, [handleCredentialResponse]);

    const handleSignIn = () => {
        if (window.google) {
            window.google.accounts.id.prompt();
        }
    };
    
    return { user, handleSignIn, handleSignOut, authError };
};