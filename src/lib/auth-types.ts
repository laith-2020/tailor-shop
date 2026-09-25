import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile, Shop } from '@/types/database';

export interface ResponsibleTailor {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'owner';
  title: string;
  nickname: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  shop: Shop | null;
  isLoading: boolean;
  isConfigured: boolean;
  activeTailor: ResponsibleTailor | null;
  availableTailors: ResponsibleTailor[];
  signIn: (identifier: string, password?: string) => Promise<{ error?: string }>;
  switchTailor: (tailorId: string) => void;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  refreshProfileAndShop: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
