import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, Shop } from '@/types/database';
import { AuthContext } from './auth-types';


// Demo fallback mock shop and profile for local test environments
const DEMO_SHOP: Shop = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'مخيطة حضرموت',
  phone: '0791234567',
  address: 'عمان - شارع وصفي التل',
  currency: 'JOD',
  measurement_unit: 'سم',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@hadramout.com',
  app_metadata: {},
  user_metadata: { full_name: 'أبو أحمد الحضرمي' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

const DEMO_PROFILE: Profile = {
  id: 'demo-user-id',
  shop_id: DEMO_SHOP.id,
  full_name: 'أبو أحمد الحضرمي (الخياط المسؤول)',
  email: 'demo@hadramout.com',
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function checkIsDemoLoggedIn() {
  if (typeof window === 'undefined' || isSupabaseConfigured) return false;
  return localStorage.getItem('tailor_demo_auth') === 'true';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (checkIsDemoLoggedIn() ? DEMO_USER : null));
  const [profile, setProfile] = useState<Profile | null>(() => (checkIsDemoLoggedIn() ? DEMO_PROFILE : null));
  const [shop, setShop] = useState<Shop | null>(() => (checkIsDemoLoggedIn() ? DEMO_SHOP : null));
  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);

  // Fetch profile and shop for authenticated user
  const fetchProfileAndShop = async (userId: string) => {
    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setShop(DEMO_SHOP);
      return;
    }

    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching profile:', profileErr.message);
        return;
      }

      if (profileData) {
        const typedProfile = profileData as Profile;
        setProfile(typedProfile);

        const { data: shopData, error: shopErr } = await supabase
          .from('shops')
          .select('*')
          .eq('id', typedProfile.shop_id)
          .maybeSingle();

        if (shopErr) {
          console.error('Error fetching shop:', shopErr.message);
        } else if (shopData) {
          setShop(shopData as Shop);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile or shop:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // Supabase auth subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndShop(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfileAndShop(session.user.id);
      } else {
        setProfile(null);
        setShop(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Mock demo authentication
        if (password.length >= 6) {
          localStorage.setItem('tailor_demo_auth', 'true');
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
          setShop(DEMO_SHOP);
          setIsLoading(false);
          return {};
        }
        setIsLoading(false);
        return { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
        return { error: error.message };
      }

      if (data.user) {
        await fetchProfileAndShop(data.user.id);
      }

      setIsLoading(false);
      return {};
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تسجيل الدخول';
      return { error: message };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (!isSupabaseConfigured) {
      localStorage.removeItem('tailor_demo_auth');
      setUser(null);
      setProfile(null);
      setShop(null);
      setIsLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setShop(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return {}; // Simulated success in demo
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل إرسال رابط استعادة كلمة المرور';
      return { error: message };
    }
  };

  const updatePassword = async (password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return {};
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تحديث كلمة المرور';
      return { error: message };
    }
  };

  const refreshProfileAndShop = async () => {
    if (user) {
      await fetchProfileAndShop(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        shop,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
        sendPasswordReset,
        updatePassword,
        refreshProfileAndShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
