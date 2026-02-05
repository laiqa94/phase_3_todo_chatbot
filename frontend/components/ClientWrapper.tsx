'use client';

import { useEffect, useState } from 'react';
import Chatbot from './Chatbot';
import { getUserId, getAccessToken, setUserId } from '@/lib/auth';
import { getCurrentUser } from '@/lib/api';

const ClientWrapper = () => {
  const [userId, setUserIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [tokenSynced, setTokenSynced] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get user ID from local storage
        let storedUserId = getUserId();
        const token = getAccessToken();

        console.log('ClientWrapper - Token available:', !!token);
        console.log('ClientWrapper - Stored user ID:', storedUserId);

        // In development, if we have a token, use user ID 1 (matching mock token)
        if (process.env.NODE_ENV === 'development' && token) {
          storedUserId = 1;
          setUserId(1); // Update localStorage
          console.log('ClientWrapper - Overriding stored user ID to 1 for development');
        }

        if (storedUserId) {
          setUserIdState(storedUserId);
          console.log('ClientWrapper - Using stored user ID:', storedUserId);
        } else if (token) {
          // If we have a token but no user ID, fetch the user profile
          try {
            const userData = await getCurrentUser();
            setUserIdState(userData.id);
            setUserId(userData.id); // Also save to localStorage for future use
            console.log('ClientWrapper - Fetched user ID from backend:', userData.id);
          } catch (error) {
            console.error('ClientWrapper - Failed to fetch user data:', error);
            // In development, we might want to use a default user ID
            if (process.env.NODE_ENV === 'development') {
              const defaultUserId = 1;
              setUserIdState(defaultUserId);
              setUserId(defaultUserId);
              console.log('ClientWrapper - Using default user ID for development:', defaultUserId);
            }
          }
        } else {
          // No token available - user might not be logged in
          console.log('ClientWrapper - No token available, user may not be logged in');
        }
      } catch (error) {
        console.error('ClientWrapper - Unexpected error:', error);
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Synchronize token to cookies
  useEffect(() => {
    const syncTokenToCookies = async () => {
      if (typeof window !== 'undefined') {
        const token = getAccessToken();

        if (token) {
          try {
            const response = await fetch('/api/syncToken', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token,
                userId: getUserId() || null
              }),
            });

            if (response.ok) {
              setTokenSynced(true);
              console.log('Token synced to cookies successfully');
            } else {
              console.warn(`Token sync failed (${response.status}): ${response.statusText}`);
              setTokenSynced(true);
            }
          } catch (error) {
            console.warn('Token sync error (continuing anyway):', error);
            setTokenSynced(true);
          }
        } else {
          setTokenSynced(true);
        }
      }
    };

    syncTokenToCookies();
  }, []);

  // If we're still loading, checking auth status, or syncing token, don't render the chatbot
  if (loading || !authChecked || !tokenSynced) {
    return null; // Don't render anything while loading, checking auth, or syncing token
  }

  // For development, if we don't have a user ID but have a token, use a default one
  if (!userId) {
    const token = getAccessToken();
    if (token && process.env.NODE_ENV === 'development') {
      console.log('ClientWrapper - Using default user ID for development with token');
      return <Chatbot userId={1} />;
    }
    // In development, render with default user ID even without token for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('ClientWrapper - Development mode: rendering with default user ID 1 for testing');
      return <Chatbot userId={1} />;
    }
    // Don't render if we still don't have a user ID and no token in production
    console.log('ClientWrapper - No user ID and no token, not rendering chatbot');
    console.log('ClientWrapper - Final state: userId=', userId, 'token=', !!getAccessToken(), 'NODE_ENV=', process.env.NODE_ENV);
    return null;
  }

  console.log('ClientWrapper - Rendering chatbot with user ID:', userId);
  console.log('ClientWrapper - Current state: userId=', userId, 'loading=', loading, 'authChecked=', authChecked);
  return <Chatbot userId={userId} />;
};

export default ClientWrapper;