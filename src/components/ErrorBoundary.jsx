import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex flex-col gap-2 my-2">
          <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{this.props.name || "Component"} Error</span>
          </div>
          <p className="text-slate-300">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="self-start px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Try Reloading Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
