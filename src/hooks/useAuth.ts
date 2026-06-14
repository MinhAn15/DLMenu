import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';
import { User } from '@supabase/supabase-js';
import { MOCK_PROFILE } from '@/lib/mockData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      const mockUserStr = localStorage.getItem('mock_user');
      if (mockUserStr) {
        setUser(JSON.parse(mockUserStr) as User);
        setProfile(MOCK_PROFILE);
      }
      setLoading(false);
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
  }, [supabase.auth]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithOTP = async (phone: string) => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await new Promise(r => setTimeout(r, 1000));
      return;
    }
    const formattedPhone = phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    if (error) throw error;
  };

  const verifyOTP = async (phone: string, token: string) => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      await new Promise(r => setTimeout(r, 1000));
      const fakeUser = { id: MOCK_PROFILE.id, phone, aud: 'authenticated' } as User;
      localStorage.setItem('mock_user', JSON.stringify(fakeUser));
      setUser(fakeUser);
      setProfile(MOCK_PROFILE);
      return { user: fakeUser, session: {} };
    }
    const formattedPhone = phone.startsWith('0') ? `+84${phone.slice(1)}` : phone;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
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
    signInWithOTP,
    verifyOTP,
    signOut,
  };
}
