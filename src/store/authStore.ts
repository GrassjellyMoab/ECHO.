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
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  joinDate?: string;
  followers?: number;
  followees?: number;
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
  //   fontSize: 'small' | 'medium' | 'large';r
  //   language: string;
  // };
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  uid: string;
  
  // Authentication actions
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { username: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
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
      uid: '',
      
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
              uid: '',
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
            console.log(userData);
            if (userData) {
              console.log('✅ User document found:', userData.username);
              set({
                isAuthenticated: true,
                firebaseUser,
                user: userData,
                isLoading: false,
                uid: firebaseUser.uid,
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
                uid: '',
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
            uid: '',
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
          return { success: true };
        } catch (error: any) {
          console.log('🔐 Login failed:', error?.code || 'Unknown error');
          set({ isLoading: false });
          
          // Handle specific Firebase Auth errors
          let errorMessage = 'Login failed. Please try again.';
          
          if (error?.code) {
            switch (error.code) {
              case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
              case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
              case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
              case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
              case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
              case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
              default:
                errorMessage = 'Login failed. Please check your credentials.';
            }
          }
          
          return { success: false, error: errorMessage };
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
          return { success: true };
        } catch (error: any) {
          console.log('📝 Registration failed:', error?.code || 'Unknown error');
          set({ isLoading: false });
          
          // Handle specific Firebase Auth errors
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error?.code) {
            switch (error.code) {
              case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists.';
                break;
              case 'auth/invalid-email':
                errorMessage = 'Invalid email address format.';
                break;
              case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
              default:
                errorMessage = 'Registration failed. Please try again.';
            }
          }
          
          return { success: false, error: errorMessage };
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