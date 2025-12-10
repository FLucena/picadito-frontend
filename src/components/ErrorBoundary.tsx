import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors and prevent sensitive information exposure
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console only in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    // In production, you could send this to an error reporting service
    // but don't expose sensitive information
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Optionally reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - doesn't expose error details
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Algo salió mal
              </h1>
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              <Button onClick={this.handleReset} className="w-full">
                Recargar Página
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

