import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { handleAuthCallbackUrl } from '@/lib/authCallback';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const destination = await handleAuthCallbackUrl(window.location.href);
        if (!mounted) return;
        navigate(destination, { replace: true });
      } catch (err) {
        console.error('[auth] Web OAuth callback failed', err);
        const message = err instanceof Error ? err.message : String(err);
        if (!mounted) return;
        setError(message);
        toast.error('Google sign-in could not be completed. Please try again.');
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-sm text-destructive">Google sign-in failed.</p>
            <button
              type="button"
              onClick={() => navigate('/auth', { replace: true })}
              className="text-sm text-primary underline"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-7 w-7 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
