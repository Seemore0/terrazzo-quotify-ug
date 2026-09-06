import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConnection } from '@/lib/local/connection';

const Welcome = () => {
  const navigate = useNavigate();
  const { session, mode, continueAsGuest } = useAuth();
  const { online } = useConnection();

  useEffect(() => {
    if (session || mode === 'guest') navigate('/', { replace: true });
  }, [session, mode, navigate]);

  const startGuest = () => {
    continueAsGuest();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-primary rounded-xl mb-4">
            <Calculator className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Terrazzo Quotation Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quotations, customers and material lists — works with or without internet
          </p>
        </div>

        <Card className="p-6 space-y-3">
          <Button className="w-full bg-gradient-primary" onClick={() => navigate('/auth')}>
            Sign in
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth?tab=signup')}>
            Create account
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={startGuest}>
            Continue as Guest
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            No email, no password, no internet. Your work is saved on this device.
          </p>
        </Card>

        {!online && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" /> You are offline — Continue as Guest works right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;
