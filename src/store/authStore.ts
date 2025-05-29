import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  joinDate: string;
  stats: {
    threads: number;
    comments: number;
    upvotes: number;
    followers: number;
    following: number;
    points: number;
  };
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    language: string;
  };
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  
  // Authentication actions
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (userData: { username: string; email: string; password: string; confirmPassword: string }) => Promise<boolean>;
  logout: () => void;
  
  // User management actions
  updateProfile: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  updateStats: (stats: Partial<User['stats']>) => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// Mock API functions (replace with real API calls later)
const mockLogin = async (username: string, password: string): Promise<{ user: User; token: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful login for any username/password combination
  if (username && password) {
    const mockUser: User = {
      id: '1',
      username: username,
      email: `${username.replace('@', '')}@example.com`,
      displayName: username.startsWith('@') ? username.slice(1).replace(/([A-Z])/g, ' $1').trim() : username,
      avatar: `https://via.placeholder.com/120x120/4FC3F7/ffffff?text=${username.slice(0, 2).toUpperCase()}`,
      bio: 'Forum enthusiast | Tech lover | Always learning',
      isVerified: Math.random() > 0.5, // Random verification status
      joinDate: 'March 2024',
      stats: {
        threads: Math.floor(Math.random() * 50) + 10,
        comments: Math.floor(Math.random() * 200) + 50,
        upvotes: Math.floor(Math.random() * 1000) + 100,
        followers: Math.floor(Math.random() * 300) + 20,
        following: Math.floor(Math.random() * 200) + 30,
        points: Math.floor(Math.random() * 500) + 100,
      },
      preferences: {
        notifications: true,
        darkMode: false,
        fontSize: 'medium',
        language: 'English',
      },
    };
    
    return {
      user: mockUser,
      token: `mock_token_${Date.now()}`,
    };
  }
  
  return null;
};

const mockRegister = async (userData: { username: string; email: string; password: string }): Promise<{ user: User; token: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockUser: User = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    displayName: userData.username.startsWith('@') ? userData.username.slice(1) : userData.username,
    avatar: `https://via.placeholder.com/120x120/9C27B0/ffffff?text=${userData.username.slice(0, 2).toUpperCase()}`,
    bio: 'New member',
    isVerified: false,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    stats: {
      threads: 0,
      comments: 0,
      upvotes: 0,
      followers: 0,
      following: 0,
      points: 0,
    },
    preferences: {
      notifications: true,
      darkMode: false,
      fontSize: 'medium',
      language: 'English',
    },
  };
  
  return {
    user: mockUser,
    token: `mock_token_${Date.now()}`,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      
      // Authentication actions
      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          const result = await mockLogin(credentials.username, credentials.password);
          
          if (result) {
            set({
              isAuthenticated: true,
              user: result.user,
              token: result.token,
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const result = await mockRegister(userData);
          
          if (result) {
            set({
              isAuthenticated: true,
              user: result.user,
              token: result.token,
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      },
      
      // User management actions
      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
      
      updatePreferences: (preferences) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: { ...currentUser.preferences, ...preferences },
            },
          });
        }
      },
      
      updateStats: (stats) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              stats: { ...currentUser.stats, ...stats },
            },
          });
        }
      },
      
      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),
      clearError: () => {
        // Can be used for error handling if needed
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential auth data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
); 