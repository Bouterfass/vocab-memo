import React from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelRightContent?: React.ReactNode; // 👈 nouveau
}

export const NeuInput: React.FC<NeuInputProps> = ({
  label,
  error,
  labelRightContent,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      
      {label && (
        <div className="flex items-center justify-between">
          <label className="ml-1 text-sm font-medium text-neu-text opacity-80">
            {label}
          </label>

          {/* Bouton ou contenu custom à droite 👇 */}
          {labelRightContent && (
            <div className="mr-1">
              {labelRightContent}
            </div>
          )}
        </div>
      )}

      <input
        className={`
          w-full bg-neu-base rounded-xl px-4 py-3
          shadow-neu-in text-neu-text placeholder-neu-dark/50
          outline-none border-none focus:ring-1 focus:ring-neu-accent/30
          transition-all duration-200
        `}
        {...props}
      />

      {error && (
        <span className="ml-1 text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};