"use client";

import React, { useState } from "react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? fallbackSrc ?? (src as string) : (src as string)}
      alt={alt}
      onError={(e) => {
        setHasError(true);
        onError?.(e as any);
      }}
      {...props}
    />
  );
};
