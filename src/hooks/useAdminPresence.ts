import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface PresenceState {
  isOnline: boolean;
  onlineAdmins: number;
  lastSeen: string | null;
}

export const useAdminPresence = () => {
  const { user } = useAuthContext();
  const [presenceState, setPresenceState] = useState<PresenceState>({
    isOnline: navigator.onLine,
    onlineAdmins: 0,
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
        const onlineCount = Object.keys(state).length;
        setPresenceState((prev) => ({
          ...prev,
          onlineAdmins: onlineCount,
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
