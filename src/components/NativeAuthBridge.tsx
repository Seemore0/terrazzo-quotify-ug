import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { toast } from 'sonner';
import { handleAuthCallbackUrl } from '@/lib/authCallback';
import { isNativeApp } from '@/lib/platform';

export const NativeAuthBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeApp()) return;

    let mounted = true;
    let listener: { remove: () => Promise<void> } | null = null;

    const processUrl = async (url: string) => {
      try {
        const destination = await handleAuthCallbackUrl(url);
        if (mounted) navigate(destination, { replace: true });
      } catch (error) {
        console.error('[auth] Deep-link callback failed', error);
        if (mounted) toast.error('Authentication callback failed. Please try again.');
      }
    };

    const setup = async () => {
      listener = await App.addListener('appUrlOpen', ({ url }) => {
        void processUrl(url);
      });

      try {
        const launch = await App.getLaunchUrl();
        if (launch?.url) await processUrl(launch.url);
      } catch (error) {
        console.warn('[auth] Could not inspect launch URL', error);
      }
    };

    void setup();

    return () => {
      mounted = false;
      if (listener) void listener.remove();
    };
  }, [navigate]);

  return null;
};
