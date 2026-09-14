import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('neel@acmetech.io');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            <span>Vidur</span>
            <span className="text-xs font-mono uppercase bg-primary-muted text-primary px-1.5 py-0.5 rounded border border-primary/30 font-semibold">
              OS
            </span>
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
              Enter your sales credentials to access the autonomous operating system.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rep@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
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
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Sales Workspace
            </Button>
          </form>



          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-secondary">
            <span>Need a new sales workspace?</span>
            <Link to="/register" className="text-primary hover:text-primary-hover font-semibold">
              Create account
            </Link>
          </div>
        </div>

        {/* Enterprise Assurance Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-foreground-tertiary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-signal-qualified" />
            <span>SOC2 Type II</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>256-Bit TLS</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-foreground-tertiary" />
            <span>SAML 2.0</span>
          </span>
        </div>
      </div>
    </div>
  );
};
