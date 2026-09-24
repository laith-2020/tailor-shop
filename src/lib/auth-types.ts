import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile, Shop } from '@/types/database';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  shop: Shop | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  refreshProfileAndShop: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
