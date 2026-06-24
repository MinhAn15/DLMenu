import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';
import { User } from '@supabase/supabase-js';
import { MOCK_PROFILE, MOCK_USERS } from '@/lib/mockData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        const parsed = JSON.parse(mockUserStr) as User;
        setTimeout(() => {
          setUser(parsed);
          const foundProfile = MOCK_USERS.find(u => u.phone === parsed.phone) || MOCK_PROFILE;
          setProfile(foundProfile);
          setLoading(false);
        }, 0);
      } else {
        setTimeout(() => setLoading(false), 0);
      }
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await new Promise(r => setTimeout(r, 1000));
      // Try to find matching user or default to shop owner (index 1)
      const foundProfile = email.includes('platform@') ? MOCK_USERS[0] : MOCK_USERS[1];
      const fakeUser = { id: foundProfile.id, email, aud: 'authenticated', phone: foundProfile.phone } as unknown as User;
      localStorage.setItem('mock_user', JSON.stringify(fakeUser));
      setUser(fakeUser);
      setProfile(foundProfile as Profile);
      return { user: fakeUser, session: {} };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      throw new Error('Not supported in mock mode');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: 'shop_owner'
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      localStorage.removeItem('mock_user');
      setUser(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
