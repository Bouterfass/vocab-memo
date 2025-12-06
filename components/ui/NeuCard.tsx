import React from 'react';

interface NeuCardProps {
  children: React.ReactNode;
  className?: string;
}

export const NeuCard: React.FC<NeuCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-neu-base rounded-2xl shadow-neu-out p-6 ${className}`}>
      {children}
    </div>
  );
};