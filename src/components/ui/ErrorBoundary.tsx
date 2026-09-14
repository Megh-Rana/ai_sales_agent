import React, { Component, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-surface-0 border border-border-default rounded-xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-h3 font-bold text-foreground">Something went wrong</h2>
            <p className="text-xs text-foreground-secondary">
              {this.props.fallbackMessage ?? 'An unexpected error occurred. Please try again.'}
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-foreground-tertiary mt-2 px-3 py-2 bg-surface-elevated rounded-lg break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
