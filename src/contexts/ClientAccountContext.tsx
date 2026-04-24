import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

type StoredClient = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  birthdayMonth?: number;
  birthdayDay?: number;
};

export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  birthdayMonth?: number;
  birthdayDay?: number;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  birthdayMonth: number;
  birthdayDay: number;
};

type LoginPayload = {
  email: string;
  password: string;
};

interface ClientAccountContextType {
  currentClient: ClientProfile | null;
  isAuthenticated: boolean;
  registerClient: (payload: RegisterPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  loginClient: (payload: LoginPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  logoutClient: () => Promise<void>;
}

const CLIENTS_KEY = 'giovanni_clients';
const CLIENT_SESSION_KEY = 'giovanni_client_session';

const ClientAccountContext = createContext<ClientAccountContextType | undefined>(undefined);

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const isStrongPassword = (value: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

type FirestoreClientProfile = {
  uid: string;
  name: string;
  email: string;
  emailNormalized: string;
  birthdayMonth?: number;
  birthdayDay?: number;
  birthdayKey?: string;
  source: 'web';
  authProvider: 'password';
  status: 'active';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

const buildBirthdayKey = (month?: number, day?: number) => {
  if (typeof month !== 'number' || typeof day !== 'number') return undefined;
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const isValidBirthday = (month: number, day: number) => {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;
  const maxDay = new Date(2000, month, 0).getDate();
  return day >= 1 && day <= maxDay;
};

const toClientProfile = (value: StoredClient): ClientProfile => ({
  id: value.id,
  name: value.name,
  email: value.email,
  createdAt: value.createdAt,
  birthdayMonth: value.birthdayMonth,
  birthdayDay: value.birthdayDay,
});

const readClients = (): StoredClient[] => {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as StoredClient[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(client =>
      typeof client?.id === 'string' &&
      typeof client?.name === 'string' &&
      typeof client?.email === 'string' &&
      typeof client?.password === 'string' &&
      typeof client?.createdAt === 'string' &&
      (typeof client?.birthdayMonth === 'undefined' || typeof client?.birthdayMonth === 'number') &&
      (typeof client?.birthdayDay === 'undefined' || typeof client?.birthdayDay === 'number')
    );
  } catch {
    return [];
  }
};

const writeClients = (clients: StoredClient[]) => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export function ClientAccountProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClient] = useState<ClientProfile | null>(() => {
    if (isFirebaseConfigured) return null;
    try {
      const email = localStorage.getItem(CLIENT_SESSION_KEY);
      if (!email) return null;
      const clients = readClients();
      const found = clients.find(client => normalizeEmail(client.email) === normalizeEmail(email));
      return found ? toClientProfile(found) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isFirebaseConfigured) return;
    if (!currentClient) {
      localStorage.removeItem(CLIENT_SESSION_KEY);
      return;
    }
    localStorage.setItem(CLIENT_SESSION_KEY, currentClient.email);
  }, [currentClient]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser?.email) {
        setCurrentClient(null);
        return;
      }

      let birthdayMonth: number | undefined;
      let birthdayDay: number | undefined;
      let profileName: string | undefined;
      let createdAt: string | undefined;

      try {
        const profileDoc = await getDoc(doc(db, 'clients', firebaseUser.uid));
        const data = profileDoc.data() as {
          name?: string;
          createdAt?: string;
          birthdayMonth?: number;
          birthdayDay?: number;
        } | undefined;
        if (typeof data?.name === 'string') profileName = data.name;
        if (typeof data?.createdAt === 'string') createdAt = data.createdAt;
        if (typeof data?.birthdayMonth === 'number') birthdayMonth = data.birthdayMonth;
        if (typeof data?.birthdayDay === 'number') birthdayDay = data.birthdayDay;
      } catch {
        // ignore profile-read failures and continue with auth profile data
      }

      setCurrentClient({
        id: firebaseUser.uid,
        name: profileName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        createdAt: createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
        birthdayMonth,
        birthdayDay,
      });
    });
  }, []);

  const registerClient = useCallback(async (payload: RegisterPayload) => {
    const name = payload.name.trim();
    const email = normalizeEmail(payload.email);
    const password = payload.password;
    const birthdayMonth = Number(payload.birthdayMonth);
    const birthdayDay = Number(payload.birthdayDay);

    if (name.length < 2) return { ok: false as const, message: 'Please enter your full name.' };
    if (!/\S+@\S+\.\S+/.test(email)) return { ok: false as const, message: 'Please enter a valid email.' };
    if (!isStrongPassword(password)) {
      return { ok: false as const, message: PASSWORD_REQUIREMENTS_MESSAGE };
    }
    if (!isValidBirthday(birthdayMonth, birthdayDay)) {
      return { ok: false as const, message: 'Please enter a valid birth month and day.' };
    }

    if (isFirebaseConfigured) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        try {
          await updateProfile(credential.user, { displayName: name });
        } catch {
          // profile display name is non-critical for signup success
        }

        try {
          const createdAt = credential.user.metadata.creationTime || new Date().toISOString();
          const nowIso = new Date().toISOString();
          const clientProfileDoc: FirestoreClientProfile = {
            uid: credential.user.uid,
            name,
            email,
            emailNormalized: email,
            birthdayMonth,
            birthdayDay,
            birthdayKey: buildBirthdayKey(birthdayMonth, birthdayDay),
            source: 'web',
            authProvider: 'password',
            status: 'active',
            createdAt,
            updatedAt: nowIso,
            lastLoginAt: nowIso,
          };

          await setDoc(doc(db, 'clients', credential.user.uid), {
            ...clientProfileDoc,
          }, { merge: true });
        } catch {
          // Firestore profile write should not block account creation
        }

        setCurrentClient({
          id: credential.user.uid,
          name,
          email: credential.user.email || email,
          createdAt: credential.user.metadata.creationTime || new Date().toISOString(),
          birthdayMonth,
          birthdayDay,
        });

        return { ok: true as const };
      } catch (error: unknown) {
        const code = (error as { code?: string })?.code;
        if (code === 'auth/email-already-in-use') {
          return { ok: false as const, message: 'An account with this email already exists.' };
        }
        if (code === 'auth/invalid-email') {
          return { ok: false as const, message: 'Please enter a valid email.' };
        }
        if (code === 'auth/weak-password') {
          return { ok: false as const, message: PASSWORD_REQUIREMENTS_MESSAGE };
        }
        return { ok: false as const, message: 'Unable to create account right now.' };
      }
    }

    const clients = readClients();
    const exists = clients.some(client => normalizeEmail(client.email) === email);
    if (exists) return { ok: false as const, message: 'An account with this email already exists.' };

    const storedClient: StoredClient = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      birthdayMonth,
      birthdayDay,
    };

    writeClients([storedClient, ...clients]);
    setCurrentClient(toClientProfile(storedClient));
    return { ok: true as const };
  }, []);

  const loginClient = useCallback(async (payload: LoginPayload) => {
    const email = normalizeEmail(payload.email);
    const password = payload.password;

    if (isFirebaseConfigured) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);

        let birthdayMonth: number | undefined;
        let birthdayDay: number | undefined;

        try {
          const profileDoc = await getDoc(doc(db, 'clients', credential.user.uid));
          const data = profileDoc.data() as {
            birthdayMonth?: number;
            birthdayDay?: number;
          } | undefined;
          if (typeof data?.birthdayMonth === 'number') birthdayMonth = data.birthdayMonth;
          if (typeof data?.birthdayDay === 'number') birthdayDay = data.birthdayDay;
        } catch {
          // ignore profile-read failures and continue with auth profile data
        }

        try {
          const nowIso = new Date().toISOString();
          await setDoc(doc(db, 'clients', credential.user.uid), {
            uid: credential.user.uid,
            name: credential.user.displayName || email.split('@')[0],
            email: credential.user.email || email,
            emailNormalized: email,
            birthdayMonth,
            birthdayDay,
            birthdayKey: buildBirthdayKey(birthdayMonth, birthdayDay),
            source: 'web',
            authProvider: 'password',
            status: 'active',
            updatedAt: nowIso,
            lastLoginAt: nowIso,
          }, { merge: true });
        } catch {
          // metadata sync should not block login
        }

        setCurrentClient({
          id: credential.user.uid,
          name: credential.user.displayName || email.split('@')[0],
          email: credential.user.email || email,
          createdAt: credential.user.metadata.creationTime || new Date().toISOString(),
          birthdayMonth,
          birthdayDay,
        });
        return { ok: true as const };
      } catch (error: unknown) {
        const code = (error as { code?: string })?.code;
        if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
          return { ok: false as const, message: 'Invalid email or password.' };
        }
        if (code === 'auth/invalid-email') {
          return { ok: false as const, message: 'Please enter a valid email.' };
        }
        return { ok: false as const, message: 'Unable to sign in right now.' };
      }
    }

    const clients = readClients();

    const found = clients.find(client => normalizeEmail(client.email) === email);
    if (!found) return { ok: false as const, message: 'No account found for this email.' };
    if (found.password !== password) return { ok: false as const, message: 'Incorrect password.' };

    setCurrentClient(toClientProfile(found));
    return { ok: true as const };
  }, []);

  const logoutClient = useCallback(async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
      setCurrentClient(null);
      return;
    }
    setCurrentClient(null);
    localStorage.removeItem(CLIENT_SESSION_KEY);
  }, []);

  const value = useMemo(() => ({
    currentClient,
    isAuthenticated: Boolean(currentClient),
    registerClient,
    loginClient,
    logoutClient,
  }), [currentClient, registerClient, loginClient, logoutClient]);

  return <ClientAccountContext.Provider value={value}>{children}</ClientAccountContext.Provider>;
}

export function useClientAccount() {
  const context = useContext(ClientAccountContext);
  if (!context) throw new Error('useClientAccount must be used within a ClientAccountProvider');
  return context;
}
