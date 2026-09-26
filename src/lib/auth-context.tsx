import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, Shop } from '@/types/database';
import { AuthContext, type ResponsibleTailor } from './auth-types';

// Demo fallback mock shop
export const DEMO_SHOP: Shop = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'مخيطة حضرموت',
  phone: '0775175613',
  address: 'الازرق - الشارع العام',
  currency: 'JOD',
  measurement_unit: 'انش',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Responsible tailors (خياطين مسؤولين)
export const RESPONSIBLE_TAILORS: ResponsibleTailor[] = [
  {
    id: 'tailor-abu-khaled',
    name: 'أبو خالد اليمني',
    phone: '0775175613',
    email: 'abukhaled@hadramout.com',
    role: 'owner',
    title: 'أبو خالد اليمني (الخياط المسؤول)',
    nickname: 'أبو خالد',
  },
  {
    id: 'tailor-mahfoudh',
    name: 'محفوظ أبو حنين',
    phone: '0780572223',
    email: 'mahfoudh@hadramout.com',
    role: 'owner',
    title: 'محفوظ أبو حنين (الخياط المسؤول)',
    nickname: 'محفوظ أبو حنين',
  },
];

function createTailorUser(tailor: ResponsibleTailor): User {
  return {
    id: tailor.id,
    email: tailor.email,
    app_metadata: {},
    user_metadata: {
      full_name: tailor.name,
      phone: tailor.phone,
      role: tailor.role,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User;
}

function createTailorProfile(tailor: ResponsibleTailor, shopId: string): Profile {
  return {
    id: tailor.id,
    shop_id: shopId,
    full_name: tailor.title,
    email: tailor.email,
    phone: tailor.phone,
    role: tailor.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function getInitialDemoShop(): Shop {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tailor_demo_shop');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
  }
  return DEMO_SHOP;
}

function getActiveDemoTailor(): ResponsibleTailor {
  if (typeof window !== 'undefined') {
    const savedId = localStorage.getItem('tailor_demo_active_user');
    const matched = RESPONSIBLE_TAILORS.find((t) => t.id === savedId);
    if (matched) return matched;
  }
  return RESPONSIBLE_TAILORS[0]; // Abu Khaled by default
}

function checkIsDemoLoggedIn(): boolean {
  if (typeof window === 'undefined' || isSupabaseConfigured) return false;
  return localStorage.getItem('tailor_demo_auth') === 'true';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeTailor, setActiveTailor] = useState<ResponsibleTailor | null>(() =>
    checkIsDemoLoggedIn() ? getActiveDemoTailor() : null
  );

  const [user, setUser] = useState<User | null>(() => {
    if (!checkIsDemoLoggedIn()) return null;
    const tailor = getActiveDemoTailor();
    return createTailorUser(tailor);
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    if (!checkIsDemoLoggedIn()) return null;
    const tailor = getActiveDemoTailor();
    return createTailorProfile(tailor, DEMO_SHOP.id);
  });

  const [shop, setShop] = useState<Shop | null>(() =>
    checkIsDemoLoggedIn() ? getInitialDemoShop() : null
  );

  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);

  // Fetch profile and shop for authenticated user in Supabase mode
  const fetchProfileAndShop = async (userId: string) => {
    if (!isSupabaseConfigured) {
      const tailor = getActiveDemoTailor();
      setActiveTailor(tailor);
      setUser(createTailorUser(tailor));
      setProfile(createTailorProfile(tailor, DEMO_SHOP.id));
      setShop(getInitialDemoShop());
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

        // Map to activeTailor if match found
        const matchingTailor = RESPONSIBLE_TAILORS.find(
          (t) =>
            t.phone === typedProfile.phone ||
            t.email === typedProfile.email ||
            typedProfile.full_name?.includes(t.name)
        );
        if (matchingTailor) {
          setActiveTailor(matchingTailor);
        }

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
      } else {
        // Fallback: create default profile for this user if it doesn't exist
        const { data: defaultShop } = await supabase.from('shops').select('*').limit(1).maybeSingle();
        const matchingTailor = RESPONSIBLE_TAILORS.find(
          (t) => t.id === userId || (user && t.email === user.email)
        ) || RESPONSIBLE_TAILORS[0];

        const targetShop = (defaultShop as Shop) || DEMO_SHOP;
        const fallbackProfile: Profile = {
          id: userId,
          shop_id: targetShop.id,
          full_name: matchingTailor.title,
          email: matchingTailor.email,
          phone: matchingTailor.phone,
          role: 'owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(fallbackProfile);
        setProfile(fallbackProfile);
        setActiveTailor(matchingTailor);
        setShop(targetShop);
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
        setActiveTailor(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchTailor = (tailorId: string) => {
    const target = RESPONSIBLE_TAILORS.find((t) => t.id === tailorId);
    if (!target) return;

    localStorage.setItem('tailor_demo_active_user', target.id);
    localStorage.setItem('tailor_demo_auth', 'true');
    setActiveTailor(target);
    setUser(createTailorUser(target));
    setProfile(createTailorProfile(target, shop?.id || DEMO_SHOP.id));
  };

  const signIn = async (identifier: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const cleanInput = identifier.trim();
      const cleanDigits = cleanInput.replace(/[\s-+]/g, '');

      if (!isSupabaseConfigured) {
        // Find matching tailor by phone, email, or name
        let matched = RESPONSIBLE_TAILORS.find((t) => {
          const tPhoneClean = t.phone.replace(/[\s-+]/g, '');
          return (
            (cleanDigits.length >= 7 && (tPhoneClean.includes(cleanDigits) || cleanDigits.includes(tPhoneClean))) ||
            t.phone === cleanInput ||
            t.email.toLowerCase() === cleanInput.toLowerCase() ||
            cleanInput.includes(t.name) ||
            t.name.includes(cleanInput)
          );
        });

        // Allow demo login email fallback or default
        if (!matched) {
          if (cleanInput.toLowerCase() === 'demo@hadramout.com' || cleanInput === '') {
            matched = RESPONSIBLE_TAILORS[0];
          } else {
            setIsLoading(false);
            return {
              error: 'رقم الهاتف أو الحساب غير مسجل. يرجى استخدام 0775175613 (أبو خالد) أو 0780572223 (محفوظ)',
            };
          }
        }

        // Validate password if supplied
        if (password && password.length < 4) {
          setIsLoading(false);
          return { error: 'كلمة المرور يجب أن لا تقل عن 4 أرقام أو أحرف' };
        }

        // Successfully log in as the matched tailor
        localStorage.setItem('tailor_demo_auth', 'true');
        localStorage.setItem('tailor_demo_active_user', matched.id);

        setActiveTailor(matched);
        setUser(createTailorUser(matched));
        const currentShop = getInitialDemoShop();
        setProfile(createTailorProfile(matched, currentShop.id));
        setShop(currentShop);
        setIsLoading(false);
        return {};
      }

      // Supabase Authenticated mode
      // If user typed a phone number, map it to corresponding email
      let emailToUse = cleanInput;
      const matchedByPhone = RESPONSIBLE_TAILORS.find(
        (t) => t.phone.replace(/\D/g, '') === cleanDigits
      );
      if (matchedByPhone) {
        emailToUse = matchedByPhone.email;
      }

      const primaryPassword = password || (matchedByPhone ? matchedByPhone.phone : '123456');

      let { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: primaryPassword,
      });

      // If failed with invalid credentials and it's a known tailor, try alternative default password
      if (error && matchedByPhone && error.message.includes('Invalid login credentials')) {
        const altPassword = primaryPassword === matchedByPhone.phone ? '123456' : matchedByPhone.phone;
        const retry = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: altPassword,
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        setIsLoading(false);
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'بيانات الدخول غير صحيحة. يرجى تشغيل ملف SQL لتسجيل الخياطين في Supabase' };
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
      localStorage.removeItem('tailor_demo_active_user');
      setUser(null);
      setProfile(null);
      setActiveTailor(null);
      setShop(null);
      setIsLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setActiveTailor(null);
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
        activeTailor,
        availableTailors: RESPONSIBLE_TAILORS,
        signIn,
        switchTailor,
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
