import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../constants/firebase";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Auto-create Firestore profile if it doesn't exist
            const { setDoc } = await import("firebase/firestore");
            const profile: User = {
              id: fbUser.uid,
              displayName: fbUser.displayName || "Student",
              email: fbUser.email || "",
              phone: fbUser.phoneNumber || "",
              photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=Student&background=674bb5&color=fff`,
              isMember: false,
              createdAt: Date.now(),
            };
            await setDoc(userDocRef, profile);
            setUser(profile);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, isLoading, isAuthenticated: !!user, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
