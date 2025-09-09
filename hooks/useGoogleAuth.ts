import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getGoogleClientId } from '../lib/constants';
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
    const [isConfigured, setIsConfigured] = useState(false);

    const handleSignOut = useCallback(() => {
        logAdminEvent('User Signed Out', user?.email || 'Unknown');
        if (window.google?.accounts?.id) {
          window.google.accounts.id.disableAutoSelect();
        }
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
        // Step 1: Check for persisted user session
        const storedUser = sessionStorage.getItem('google_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                sessionStorage.removeItem('google_user');
            }
        }

        // Step 2: Determine if Google Sign-In is configured.
        // This runs once and triggers a re-render if `isConfigured` changes.
        const GOOGLE_CLIENT_ID = getGoogleClientId();
        const isSignInConfigured = !!(GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID'));
        setIsConfigured(isSignInConfigured);
    }, []); 
    
    useEffect(() => {
        // Step 3: This effect runs after `isConfigured` is set to true.
        // By this point, the component using the hook should have rendered the button container.
        if (!isConfigured) {
            if (getGoogleClientId()?.includes('YOUR_GOOGLE_CLIENT_ID')) {
              console.warn("Google Sign-In is not configured with a valid Client ID. Login functionality will be disabled.");
            }
            return;
        }

        const GOOGLE_CLIENT_ID = getGoogleClientId()!;

        const initializeGoogleSignIn = () => {
            if (!window.google?.accounts?.id) {
                console.error("Google Identity Services library not loaded.");
                setAuthError("Google Sign-In script not loaded. Please check your connection.");
                return;
            }
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                });

                const signInButton = document.getElementById('google-signin-button');
                if (signInButton) {
                    // Clear the container in case it was rendered before (e.g., on hot-reload)
                    signInButton.innerHTML = '';
                    window.google.accounts.id.renderButton(
                        signInButton,
                        { theme: "outline", size: "large", type: "standard", shape: "pill" }
                    );
                }

                // Prompt for sign-in only if the user isn't already logged in from the session.
                if (!sessionStorage.getItem('google_user')) {
                     window.google.accounts.id.prompt();
                }
            } catch (e) {
                 console.error("Google Sign-In initialization error:", e);
                 setAuthError(e instanceof Error ? e.message : "An unknown error occurred during Google Sign-In setup.");
            }
        };
        
        // The GSI script is loaded with `async defer`, so we need to check if `window.google` is ready.
        // If not, we wait for the script to load.
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                const handleScriptLoad = () => initializeGoogleSignIn();
                const handleScriptError = () => {
                    console.error("Failed to load Google Identity Services script.");
                    setAuthError("Could not load Google Sign-In script. Please check your internet connection and try again.");
                    setIsConfigured(false);
                };
                script.addEventListener('load', handleScriptLoad);
                script.addEventListener('error', handleScriptError);
                return () => {
                    script.removeEventListener('load', handleScriptLoad);
                    script.removeEventListener('error', handleScriptError);
                };
            } else {
                 console.error("Google Identity Services script tag not found in HTML.");
                 setAuthError("Google Sign-In script not found.");
            }
        }
    }, [isConfigured, handleCredentialResponse]);

    const handleSignIn = () => {
        if (isConfigured && window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        }
    };
    
    return { user, handleSignIn, handleSignOut, authError, isConfigured };
};
