import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { auth, db } from '../firebase/config';
import { cleanupDataStore } from './dataStore';

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  joinDate?: string;
  // stats: {
  //   threads: number;
  //   comments: number;
  //   upvotes: number;
  //   followers: number;
  //   following: number;
  //   points: number;
  // };
  // preferences: {
  //   notifications: boolean;
  //   darkMode: boolean;
  //   fontSize: 'small' | 'medium' | 'large';
  //   language: string;
  // };
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  
  // Authentication actions
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (userData: { username: string; email: string; password: string; confirmPassword: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Firebase Auth management
  initializeAuth: () => (() => void) | undefined;
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => Promise<void>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}



// Helper function to get user document from Firestore
const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: true, // Start with loading true until auth state is determined
      user: null,
      firebaseUser: null,
      
      // Initialize Firebase Auth listener
      initializeAuth: () => {
        set({ isLoading: true });
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('🔥 Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
          
          if (firebaseUser) {
            console.log('🔥 Firebase user details:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified
            });
            // User is signed in
            await get().setFirebaseUser(firebaseUser);
          } else {
            // User is signed out
            console.log('🔥 User signed out');
            console.log('🧹 Cleaning up data store on auth state change...');
            cleanupDataStore(); // Ensure data store is cleaned up when auth state changes to signed out
            set({
              isAuthenticated: false,
              user: null,
              firebaseUser: null,
              isLoading: false,
            });
          }
        });
        
        // Return unsubscribe function for cleanup
        return unsubscribe;
      },
      
      // Set Firebase user and fetch user data
      setFirebaseUser: async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            console.log('🔥 Fetching user document for UID:', firebaseUser.uid);
            const userData = await getUserDocument(firebaseUser.uid);
            
            if (userData) {
              console.log('✅ User document found:', userData.username);
              set({
                isAuthenticated: true,
                firebaseUser,
                user: userData,
                isLoading: false,
              });
            } else {
              // User document doesn't exist yet - this might happen if user is created
              // in Firebase Auth but user document is not yet created in Firestore
              console.warn('⚠️ User document not found in Firestore for UID:', firebaseUser.uid);
              set({
                isAuthenticated: true,
                firebaseUser,
                user: null, // User will need to be created externally
                isLoading: false,
              });
            }
          } catch (error) {
            console.error('❌ Error setting Firebase user:', error);
            set({ isLoading: false });
          }
        } else {
          set({
            isAuthenticated: false,
            firebaseUser: null,
            user: null,
            isLoading: false,
          });
        }
      },
      
      // Authentication actions
      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          // Use the username as email directly if it contains @
          // Otherwise, you'll need to implement username->email lookup
          const email = credentials.username.includes('@') 
            ? credentials.username 
            : credentials.username; // For now, assume username IS the email
          
          console.log('Attempting login with email:', email);
          const userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
          console.log('Login successful, user:', userCredential.user.uid);
          
          // Firebase Auth state change will handle the rest
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          );
          
          // Firebase Auth state change will handle the rest
          // User document should already exist in Firestore (managed externally)
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        try {
          console.log('🧹 Cleaning up data store on logout...');
          cleanupDataStore(); // Clean up Firestore listeners before signing out
          await signOut(auth);
          // Firebase Auth state change will handle clearing the state
        } catch (error) {
          console.error('Logout error:', error);
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
      }),
    }
  )
); 