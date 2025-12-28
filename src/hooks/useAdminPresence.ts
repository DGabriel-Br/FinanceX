import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface OnlineAdmin {
  user_id: string;
  email: string;
  online_at: string;
}

interface PresenceState {
  isOnline: boolean;
  onlineAdmins: OnlineAdmin[];
  lastSeen: string | null;
}

export const useAdminPresence = () => {
  const { user } = useAuthContext();
  const [presenceState, setPresenceState] = useState<PresenceState>({
    isOnline: navigator.onLine,
    onlineAdmins: [],
    lastSeen: null,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('admin_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const admins: OnlineAdmin[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            admins.push({
              user_id: presence.user_id || key,
              email: presence.email || 'Admin',
              online_at: presence.online_at || new Date().toISOString(),
            });
          }
        });
        
        setPresenceState((prev) => ({
          ...prev,
          onlineAdmins: admins,
        }));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Admin joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Admin left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
          setPresenceState((prev) => ({
            ...prev,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          }));
        }
      });

    // Handle browser online/offline events
    const handleOnline = () => {
      setPresenceState((prev) => ({ ...prev, isOnline: true }));
      channel.track({
        user_id: user.id,
        email: user.email,
        online_at: new Date().toISOString(),
      });
    };

    const handleOffline = () => {
      setPresenceState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.unsubscribe();
    };
  }, [user]);

  return presenceState;
};
