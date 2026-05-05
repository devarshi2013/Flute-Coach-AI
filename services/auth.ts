import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  photo?: string;
  provider: 'google' | 'apple' | 'email';
};

type StoredAccount = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const USERS_KEY   = 'fc_users';
const SESSION_KEY = 'fc_session';

let currentUser: AuthUser | null = null;

const hashPassword = (password: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

const loadAccounts = async (): Promise<StoredAccount[]> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveAccounts = (accounts: StoredAccount[]) =>
  AsyncStorage.setItem(USERS_KEY, JSON.stringify(accounts));

export const auth = {
  /** Create a new account and log in immediately. */
  register: async (name: string, email: string, password: string): Promise<AuthUser> => {
    if (!name.trim())         throw new Error('Full name is required.');
    if (!email.trim())        throw new Error('Email address is required.');
    if (password.length < 6)  throw new Error('Password must be at least 6 characters.');

    const accounts   = await loadAccounts();
    const normalised = email.toLowerCase().trim();

    if (accounts.find(a => a.email === normalised)) {
      throw new Error('An account with this email already exists.');
    }

    const id           = Crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await saveAccounts([...accounts, { id, name: name.trim(), email: normalised, passwordHash }]);

    const user: AuthUser = { id, email: normalised, name: name.trim(), provider: 'email' };
    currentUser = user;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  /** Sign in with email + password. */
  loginWithEmail: async (email: string, password: string): Promise<AuthUser> => {
    if (!email || !password) throw new Error('Email and password are required.');

    const accounts   = await loadAccounts();
    const normalised = email.toLowerCase().trim();
    const account    = accounts.find(a => a.email === normalised);

    if (!account) throw new Error('No account found with this email. Please sign up first.');

    const hash = await hashPassword(password);
    if (hash !== account.passwordHash) throw new Error('Incorrect password. Please try again.');

    const user: AuthUser = { id: account.id, email: account.email, name: account.name, provider: 'email' };
    currentUser = user;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  /** Persist a Google / Apple OAuth user. */
  setUser: async (user: AuthUser): Promise<void> => {
    currentUser = user;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  /** Re-hydrate session on cold start. */
  restoreSession: async (): Promise<AuthUser | null> => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) currentUser = JSON.parse(raw);
    } catch {
      currentUser = null;
    }
    return currentUser;
  },

  getUser: (): AuthUser | null => currentUser,

  logout: async (): Promise<void> => {
    currentUser = null;
    await AsyncStorage.removeItem(SESSION_KEY);
  },
};
