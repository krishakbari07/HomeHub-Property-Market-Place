import React, { useState } from "react";

const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

const ImageWithFallback = ({ src, alt, className = "", fallbackSrc = DEFAULT_PROPERTY_IMAGE, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || "Property"}
      onError={handleError}
      loading={props.loading || "lazy"}
      decoding="async"
      className={className}
      {...props}
    />
  );
};

export default ImageWithFallback;
