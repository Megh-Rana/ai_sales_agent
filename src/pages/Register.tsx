import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Vidur
          </h2>
          <p className="text-caption text-foreground-secondary mt-1">
            Autonomous B2B Sales Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-0 border border-border-default rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Create Sales Workspace</h3>
            <p className="text-xs text-foreground-tertiary">
              Deploy autonomous sales agents and intent discovery for your team.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Company / Workspace Name"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Acme Technologies"
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Work Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@acmetech.io"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Set Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Initialize Workspace
            </Button>
          </form>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-secondary">
            <span>Already have an account?</span>
            <Link to="/login" className="text-primary hover:text-primary-hover font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-foreground-tertiary">
          By continuing, you agree to the Vidur Enterprise Master Services Agreement & Privacy Policy.
        </div>
      </div>
    </div>
  );
};
