import { useEffect, useState } from 'react';

// Hook to get current user info
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          role: payload.role,
          name: payload.name,
          email: payload.email
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
}