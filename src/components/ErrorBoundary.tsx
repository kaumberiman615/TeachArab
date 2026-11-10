import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  title?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  onNavigateBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = `[ErrorBoundary Catch] Name: ${error.name || 'Error'} | Message: ${error.message || 'Unknown error'} | Stack: ${error.stack || 'No stack'} | ComponentStack: ${errorInfo.componentStack || 'No component stack'}`;
    console.error(errorDetails);
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
      this.setState({ hasError: false, error: null });
    } else {
      window.location.reload();
    }
  };

  private handleBack = () => {
    if (this.props.onNavigateBack) {
      this.props.onNavigateBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = '#/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-sm text-center my-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0A254D]">
              {this.props.title || 'Terjadi kesalahan pada tampilan ini'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {this.props.fallbackMessage ||
                'Komponen ini mengalami kendala teknis saat memuat data. Anda dapat memuat ulang atau kembali ke halaman sebelumnya.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 text-xs font-black bg-[#0A254D] hover:bg-black text-white rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat ulang</span>
            </button>
            <button
              type="button"
              onClick={this.handleBack}
              className="px-4 py-2 text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
