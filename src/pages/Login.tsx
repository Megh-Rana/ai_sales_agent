import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail, AlertCircle, Timer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
// Auth via real API: POST /api/auth/login (see AuthContext.tsx)
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('neel@vidur.in');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLockedOut(false);

    try {
      await login(email, password);
      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      const apiErr = err as Error & { status?: number };
      if (apiErr.status === 429) {
        setIsLockedOut(true);
        setError(apiErr.message);
      } else if (apiErr.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(apiErr.message || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Aperture */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-1 border border-primary/40 text-primary shadow-md">
          <svg
            className="w-6 h-6 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l8 16 8-16" />
            <path d="M8 4l4 8 4-8" />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Vidur
          </h2>
          <p className="text-caption text-foreground-secondary mt-1">
            Enterprise AI Sales Intelligence Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-0 border border-border-default rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Sign In to Workspace</h3>
            <p className="text-xs text-foreground-tertiary">
              Enter your credentials to access the sales platform.
            </p>
          </div>

          {/* Error / Lockout Banner */}
          {error && (
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
                isLockedOut
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
              role="alert"
              aria-live="assertive"
            >
              {isLockedOut ? (
                <Timer className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              id="login-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rep@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                id="login-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <a href="#forgot" className="text-[11px] text-primary hover:text-primary-hover">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={loading}
              disabled={isLockedOut}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLockedOut ? 'Account Locked' : 'Enter Sales Workspace'}
            </Button>
          </form>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-secondary">
            <span>Need a new sales workspace?</span>
            <Link to="/register" className="text-primary hover:text-primary-hover font-semibold">
              Create account
            </Link>
          </div>
        </div>

        {/* Dev hint */}
        <p className="mt-4 text-center text-[11px] text-foreground-tertiary">
          Admins: <code className="font-mono">admin@vidur.in</code> / <code className="font-mono">admin@2026</code> | <code className="font-mono">neel@vidur.in</code> / <code className="font-mono">neelit002</code> | <code className="font-mono">megh@vidur.in</code> / <code className="font-mono">meghce099</code>
        </p>
      </div>
    </div>
  );
};
