// src/components/ui/Avatar.tsx

import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  fallback,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-primary-500 flex items-center justify-center text-light-1 font-semibold">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export const AvatarImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-full object-cover" />
);

export const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full h-full bg-primary-500 flex items-center justify-center text-light-1 font-semibold">
    {children}
  </div>
);

export default Avatar;