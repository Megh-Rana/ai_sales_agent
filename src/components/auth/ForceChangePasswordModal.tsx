import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

export const ForceChangePasswordModal: React.FC = () => {
  const { user, changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only render if logged-in user is flagged to change their password
  if (!user || !user.must_change_password) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(newPassword);
      toast.success('Your new password has been set! Welcome to your sales workspace.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="bg-surface-0 border border-primary/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-thistle to-primary" />

        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary-muted text-primary border border-primary/30 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-signal-high/15 text-signal-high border border-signal-high/30 font-semibold">
              First-Time Login Security Setup
            </span>
            <h2 className="text-xl font-bold text-foreground">Set Your Permanent Password</h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Welcome, <strong className="text-foreground">{user.full_name || user.email}</strong>. Your account was created with a temporary password. Please choose a new password to continue.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password (min 6 characters)"
            type="password"
            id="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Create a strong password"
            leftIcon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            id="confirm-new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            autoComplete="new-password"
          />

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center text-white"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
            >
              <span className="text-white font-semibold">Save Password & Enter Workstation</span>
            </Button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2 text-center text-xs text-foreground-tertiary hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out and exit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
