import React from 'react';

export const NexusLogo = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`nexus-hex-logo ${className}`}
  >
    <defs>
      {/* 24K Pure Gold Luxury Gradient */}
      <linearGradient id="nexus-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="75%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>

      <radialGradient id="nexus-gold-core-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#EAB308" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
      </radialGradient>

      <filter id="hex-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="glow" />
        <feFlood floodColor="#EAB308" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="glow" operator="in" result="coloredGlow" />
        <feMerge>
          <feMergeNode in="coloredGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Ambient Gold Core */}
    <circle cx="50" cy="50" r="32" fill="url(#nexus-gold-core-glow)" />

    {/* Outer Tech Hexagon in 24K Gold */}
    <polygon
      points="50,6 88,28 88,72 50,94 12,72 12,28"
      stroke="url(#nexus-grad-gold)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(10, 10, 14, 0.85)"
      filter="url(#hex-gold-glow)"
    />

    {/* Inner Precision Quantum Matrix */}
    <polygon
      points="50,22 74,36 74,64 50,78 26,64 26,36"
      stroke="rgba(234, 179, 8, 0.45)"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      fill="none"
    />

    {/* Center 24K Gold High-Energy Node */}
    <circle cx="50" cy="50" r="7" fill="#FEF08A" filter="url(#hex-gold-glow)" />

    {/* Geometric Axis Rays */}
    <line x1="50" y1="22" x2="50" y2="42" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="58" x2="50" y2="78" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="36" x2="43" y2="46" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <line x1="57" y1="54" x2="74" y2="64" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <line x1="74" y1="36" x2="57" y2="46" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <line x1="43" y1="54" x2="26" y2="64" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default NexusLogo;
