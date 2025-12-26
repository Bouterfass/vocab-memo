import React from 'react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const NeuButton: React.FC<NeuButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseStyle = "font-semibold rounded-xl px-6 py-3 transition-all duration-200 active:shadow-neu-in outline-none focus:ring-2 focus:ring-neu-dark/20";
  
  // Primary: The text color pops, regular neu shadow
  const primaryStyle = "text-neu-accent";
  // Secondary: More subtle
  const secondaryStyle = "text-neu-text";
  // Danger: Red text
  const dangerStyle = "text-red-500";

  let variantStyle = primaryStyle;
  if (variant === 'secondary') variantStyle = secondaryStyle;
  if (variant === 'danger') variantStyle = dangerStyle;

  const stateStyle = disabled
    ? "opacity-60 cursor-not-allowed shadow-neu-in pointer-events-none"
    : "shadow-neu-out hover:-translate-y-0.5";

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${stateStyle} ${widthStyle} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
