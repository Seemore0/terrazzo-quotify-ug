import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calculator, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const friendly = (msg: string) => {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password. Try again, or reset your password below.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email already has an account — switch to “Sign in”.';
  if (m.includes('email not confirmed')) return 'Your email is not confirmed yet. Check your inbox for the confirmation link.';
  if (m.includes('password') && m.includes('6')) return 'Password must be at least 6 characters.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Network problem — check your internet connection and try again.';
  return msg;
};

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'auth' | 'forgot'>('auth');

  const redirectTo = params.get('next') || '/dashboard';

  useEffect(() => {
    if (session) navigate(redirectTo, { replace: true });
  }, [session, navigate, redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return toast.error(friendly(error.message));
    toast.success('Signed in');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return toast.error(friendly(error.message));
    if (data.session) {
      toast.success('Account created — you are signed in');
    } else {
      toast.success('Account created. Check your email to confirm, then sign in.');
      setTab('signin');
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(friendly(result.error.message));
      return;
    }
    if (result.redirected) return;
    toast.success('Signed in');
  };


  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(friendly(error.message));
    toast.success('Reset link sent — check your email.');
    setMode('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-primary rounded-xl mb-4">
            <Calculator className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Terrazzo Quotation Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">Create quotations, track customers, grow your business</p>
        </div>

        <Card className="p-6">
          {mode === 'forgot' ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <h2 className="font-semibold">Reset your password</h2>
                <p className="text-sm text-muted-foreground mt-1">We'll email you a link to set a new password.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input id="fp-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('auth')}>
                Back to sign in
              </Button>
            </form>
          ) : (
            <>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.3h12.6c-.3 2.1-1.6 5.2-4.6 7.3l7.6 5.9c4.4-4.1 6.5-10.1 6.5-17.4z"/>
                  <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.8-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2 1.4-4.7 2.4-7.8 2.4-6.3 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or use email</span>
                </div>
              </div>

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="si-email">Email</Label>
                      <Input id="si-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="si-password">Password</Label>
                      <Input id="si-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary" disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                    </Button>
                    <button type="button" onClick={() => setMode('forgot')} className="text-sm text-muted-foreground hover:text-primary w-full text-center">
                      Forgot your password?
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="su-email">Email</Label>
                      <Input id="su-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-password">Password</Label>
                      <Input id="su-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                      <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-primary" disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to quotation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
