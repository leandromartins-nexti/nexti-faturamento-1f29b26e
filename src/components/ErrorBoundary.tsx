import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/ds';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const { error } = this.state;
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white border border-danger/30 rounded-md overflow-hidden">
          <div className="flex items-start gap-3 p-5 bg-danger-bg border-b border-danger/20">
            <AlertTriangle className="size-5 text-danger mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-navy-700">
                {this.props.fallbackTitle ?? 'Algo deu errado ao renderizar esta tela.'}
              </div>
              <div className="text-sm text-ink-600 mt-1">{error.message}</div>
            </div>
            <Button size="sm" variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={this.reset}>
              Tentar de novo
            </Button>
          </div>
          {error.stack && (
            <pre className="p-4 text-xs text-ink-600 overflow-auto max-h-80 bg-bg-subtle whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
