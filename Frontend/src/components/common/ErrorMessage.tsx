import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 flex items-start space-x-3 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold">An issue occurred</h4>
        <p className="text-sm text-red-700 mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 px-2.5 py-1.5 rounded transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
