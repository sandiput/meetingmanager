import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  whatsapp_number?: string;
  profile_picture?: string;
  avatar?: string;
  role: 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status from server
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/status`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data.isAuthenticated && data.data.admin) {
            const admin = data.data.admin;
            setUser({
          id: admin.id.toString(),
          username: admin.username,
          email: admin.email,
          name: admin.full_name || admin.name,
          whatsapp_number: admin.whatsapp_number,
          profile_picture: admin.profile_picture,
          role: 'admin',
          created_at: admin.created_at || new Date().toISOString()
        });
            setIsAuthenticated(true);
            localStorage.setItem('meeting_manager_user', JSON.stringify({
          id: admin.id.toString(),
          username: admin.username,
          email: admin.email,
          name: admin.full_name || admin.name,
          whatsapp_number: admin.whatsapp_number,
          profile_picture: admin.profile_picture,
          role: 'admin',
          created_at: admin.created_at || new Date().toISOString()
        }));
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Fallback to localStorage if server check fails
        const savedUser = localStorage.getItem('meeting_manager_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem('meeting_manager_user');
          }
        }
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { admin } = data.data;
        
        setUser({
          id: admin.id.toString(),
          username: admin.username,
          email: admin.email,
          name: admin.full_name || admin.name,
          whatsapp_number: admin.whatsapp_number,
          profile_picture: admin.profile_picture,
          role: 'admin',
          created_at: admin.created_at || new Date().toISOString()
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('meeting_manager_user');
    }
  };

  const updateProfile = async (): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/profile`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const admin = result.data;
        const updatedUser = {
          id: admin.id.toString(),
          username: admin.username,
          email: admin.email,
          name: admin.full_name || admin.name,
          whatsapp_number: admin.whatsapp_number,
          profile_picture: admin.profile_picture,
          role: 'admin' as const,
          created_at: admin.created_at || new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('meeting_manager_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword: newPassword }),
      });

      return response.ok;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return response.ok;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      updateProfile,
      changePassword,
      resetPassword,
    }}>
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