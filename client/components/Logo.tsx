
import React from 'react';

export const Logo: React.FC<{ className?: string; imgClass?: string }> = ({ className, imgClass = "h-10" }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="myuxscore logo"
        className={`${imgClass} w-auto`}
      />
    </div>
  );
};
