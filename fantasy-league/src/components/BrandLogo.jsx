import React from 'react';
import logoMark from '../assets/logo-mark.png';

/** FOFA CONNECT brand mark (bundled asset — hashed URL, base-safe). */
export default function BrandLogo({ size = 32, style }) {
  return (
    <img
      src={logoMark}
      alt="FOFA"
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0, ...style }}
      draggable={false}
    />
  );
}
