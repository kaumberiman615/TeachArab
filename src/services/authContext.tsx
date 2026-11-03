import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  isFirebaseConfigured,
} from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => null,
  signOutUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    if (!isFirebaseConfigured) {
      alert('Firebase belum dikonfigurasi. Silakan periksa file konfigurasi atau variabel lingkungan VITE_FIREBASE_*.');
      return null;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      console.error('Gagal login dengan Google:', error);
      // Don't throw for popup closed by user
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        alert('Gagal masuk dengan Google: ' + (error?.message || 'Terjadi kesalahan'));
      }
      return null;
    }
  };

  const signOutUser = async (): Promise<void> => {
    if (!isFirebaseConfigured) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isConfigured: isFirebaseConfigured, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
