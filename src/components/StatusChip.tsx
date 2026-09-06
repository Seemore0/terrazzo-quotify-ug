import { Cloud, Smartphone, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConnection } from '@/lib/local/connection';

/** Subtle, never-blocking indicator of where the work is being saved. */
export const StatusChip = () => {
  const { online } = useConnection();
  const { session, isGuest } = useAuth();

  const state = !online
    ? { icon: WifiOff, label: 'Offline', title: 'No internet — everything is saved on this device' }
    : isGuest
      ? { icon: Smartphone, label: 'Guest', title: 'Guest mode — saved on this device' }
      : session
        ? { icon: Cloud, label: 'Online', title: 'Signed in — saved on this device and in the cloud' }
        : { icon: Smartphone, label: 'On device', title: 'Saved on this device' };

  const Icon = state.icon;

  return (
    <span
      title={state.title}
      className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
    >
      <Icon className="h-3 w-3" />
      {state.label}
    </span>
  );
};
