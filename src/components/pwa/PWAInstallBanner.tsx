import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __vidur_deferred_pwa_prompt?: BeforeInstallPromptEvent | null;
  }
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.__vidur_deferred_pwa_prompt || null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check standalone mode (already installed & running inside PWA)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://'));

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;
  const isSecure = typeof window !== 'undefined' && window.isSecureContext;

  useEffect(() => {
    if (isStandalone) return;

    // Check recent dismissal (within 24 hours)
    const dismissedTimestamp = localStorage.getItem('vidur_pwa_dismissed_at');
    const wasDismissedRecently =
      dismissedTimestamp && Date.now() - parseInt(dismissedTimestamp, 10) < 24 * 60 * 60 * 1000;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__vidur_deferred_pwa_prompt = promptEvent;
      setDeferredPrompt(promptEvent);

      if (!wasDismissedRecently) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Global custom event trigger from UserMenu / Settings / TopBar
    const manualTriggerHandler = () => {
      handleInstallClick();
    };
    window.addEventListener('trigger-pwa-install', manualTriggerHandler);

    // On mobile devices, if not standalone and not recently dismissed, show banner
    if (isMobile && !wasDismissedRecently) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', manualTriggerHandler);
    };
  }, [isStandalone, isMobile]);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || window.__vidur_deferred_pwa_prompt;
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          setShowInstructions(false);
        }
        setDeferredPrompt(null);
        window.__vidur_deferred_pwa_prompt = null;
      } catch (err) {
        console.warn('[PWA] Prompt error, displaying manual guide:', err);
        setShowInstructions(true);
      }
    } else {
      // Browser didn't provide native prompt event (e.g. Insecure HTTP on Android, iOS Safari, or already cached)
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('vidur_pwa_dismissed_at', Date.now().toString());
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {isVisible && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-surface-elevated/95 backdrop-blur-md border border-primary/30 rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-primary">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate">Install Vidur Mobile</h4>
                <p className="text-[11px] text-foreground-secondary truncate">
                  {isAndroid ? 'Native Android App & Offline Access' : 'Install on home screen for full app view'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss installation prompt"
                className="p-1.5 text-foreground-tertiary hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Manual Installation Modal for Android / iOS */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-elevated border border-border-strong rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Install Vidur OS App</h3>
                  <p className="text-xs text-foreground-secondary">
                    {isAndroid ? 'Android Chrome Installation' : isIOS ? 'iOS Safari Installation' : 'Mobile Web App'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1.5 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-1">
              {isAndroid ? (
                <>
                  <div className="p-3 bg-surface rounded-xl border border-border space-y-2.5 text-xs text-foreground">
                    <p className="font-semibold text-primary flex items-center gap-1.5">
                      <span>How to install on Android Chrome:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-foreground-secondary">
                      <li>
                        Tap the <strong className="text-foreground">⋮ (Menu)</strong> icon in Chrome's top-right corner.
                      </li>
                      <li>
                        Select <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home screen"</strong>.
                      </li>
                      <li>
                        Tap <strong className="text-foreground">"Install"</strong> in the prompt. Vidur OS will appear directly in your Android launcher!
                      </li>
                    </ol>
                  </div>

                  {!isSecure && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 space-y-1">
                      <p className="font-medium flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Connected via Local HTTP</span>
                      </p>
                      <p className="text-foreground-secondary">
                        Chrome automatically activates 1-tap installation on HTTPS origins. When testing over local Wi-Fi IP, use Chrome's top-right menu (⋮) → "Add to Home screen" or use the Cloudflare HTTPS tunnel URL.
                      </p>
                    </div>
                  )}
                </>
              ) : isIOS ? (
                <div className="p-3 bg-surface rounded-xl border border-border space-y-2.5 text-xs text-foreground">
                  <p className="font-semibold text-primary">How to install on Apple iOS (Safari):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-foreground-secondary">
                    <li>
                      Tap the <strong className="text-foreground">Share</strong> icon (square with upward arrow) at the bottom.
                    </li>
                    <li>
                      Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong>.
                    </li>
                    <li>
                      Tap <strong className="text-foreground">"Add"</strong> in the top-right corner to launch in full standalone view.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="p-3 bg-surface rounded-xl border border-border space-y-2.5 text-xs text-foreground">
                  <p className="font-semibold text-primary">Desktop App Installation:</p>
                  <p className="text-foreground-secondary">
                    Click the install icon in the right side of your browser address bar (top right), then click "Install" to run Vidur OS as an independent desktop window.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-muted rounded-xl border border-border text-xs">
                <span className="truncate text-foreground-tertiary select-all">{window.location.href}</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-hover text-foreground transition-all shrink-0 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

