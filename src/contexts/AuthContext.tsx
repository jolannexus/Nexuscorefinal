import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Role, Permissions, User } from '../types/index';
import { PERMISSIONS } from '../config/constants';

interface AuthContextType {
  user: { uid: string; email: string; displayName?: string | null } | null;
  profile: User | null;
  role: Role | null;
  permissions: Permissions | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string | null } | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const token = localStorage.getItem('nexus_auth_token');
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName
        });
        setProfile({
          uid: data.uid,
          email: data.email,
          role: data.role,
          agencyId: data.tenantId,
          displayName: data.displayName,
          createdAt: new Date().toISOString()
        } as User);
      } else {
        // Clear invalid token
        localStorage.removeItem('nexus_auth_token');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing active session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const role = profile?.role || null;
  const permissions = role ? PERMISSIONS[role] : null;

  const value = useMemo(() => ({
    user,
    profile,
    role,
    permissions,
    loading,
    refreshAuth
  }), [user, profile, role, permissions, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
