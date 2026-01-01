import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  subscription_type: 'free' | 'pro';
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  daily_prompt_count: number;
  last_prompt_reset: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Check if subscription has expired
      if (data.subscription_type === 'pro' && data.subscription_end_date) {
        const endDate = new Date(data.subscription_end_date);
        if (endDate < new Date()) {
          // Subscription expired, reset to free
          await supabase
            .from('profiles')
            .update({
              subscription_type: 'free',
              subscription_start_date: null,
              subscription_end_date: null,
            })
            .eq('id', userId);
          data.subscription_type = 'free';
          data.subscription_start_date = null;
          data.subscription_end_date = null;
        }
      }

      // Reset daily prompt count if last reset was more than 24 hours ago
      const lastReset = new Date(data.last_prompt_reset);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff >= 24) {
        await supabase
          .from('profiles')
          .update({
            daily_prompt_count: 0,
            last_prompt_reset: now.toISOString(),
          })
          .eq('id', userId);
        data.daily_prompt_count = 0;
        data.last_prompt_reset = now.toISOString();
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
