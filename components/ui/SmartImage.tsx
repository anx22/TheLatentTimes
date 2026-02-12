
import React, { useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // If true, eager load (for covers)
}

export const SmartImage: React.FC<SmartImageProps> = ({ src, alt, className = "", priority = false, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {/* Placeholder / Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse z-0" />
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`
          relative z-10 w-full h-full object-cover transition-all duration-700 ease-out
          ${loaded ? 'opacity-100 grayscale-0 scale-100' : 'opacity-0 grayscale scale-105'}
          ${className}
        `}
        {...props}
      />

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-100 text-neutral-400">
           <span className="text-[10px] font-mono uppercase tracking-widest">Image Signal Lost</span>
        </div>
      )}
    </div>
  );
};
