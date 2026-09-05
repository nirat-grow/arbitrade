import React from 'react';

export const NexusLogo = ({ size = 46, className = '' }) => (
  <div className={`nexus-brand-symbol ${className}`} style={{ width: size, height: size }}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="karo-svg-logo"
    >
      <defs>
        {/* 24K Liquid Mirror Gold Metallic Gradient */}
        <linearGradient id="karo-gold-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="25%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#EAB308" />
          <stop offset="85%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Deep Bullion Shade for 3D Bevel Facets */}
        <linearGradient id="karo-gold-dark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="40%" stopColor="#B45309" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Specular White-Gold Flare */}
        <linearGradient id="karo-specular-light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EAB308" stopOpacity="0.1" />
        </linearGradient>

        {/* Radial Ambient Core Bloom */}
        <radialGradient id="karo-ambient-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#EAB308" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0B0B0F" stopOpacity="0" />
        </radialGradient>

        {/* Glowing Filters */}
        <filter id="karo-glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feFlood floodColor="#EAB308" floodOpacity="0.65" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="karo-core-flare" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="flare" />
          <feMerge>
            <feMergeNode in="flare" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient Volumetric Backlight */}
      <circle cx="50" cy="50" r="38" fill="url(#karo-ambient-bloom)" />

      {/* Outer Obsidian Shield Background */}
      <polygon
        points="50,6 89,28 89,72 50,94 11,72 11,28"
        fill="rgba(10, 10, 16, 0.94)"
        stroke="url(#karo-gold-primary)"
        strokeWidth="2.8"
        strokeLinejoin="round"
        filter="url(#karo-glow-heavy)"
      />

      {/* Inner Precision Hairline Frame */}
      <polygon
        points="50,13 83,32 83,68 50,87 17,68 17,32"
        fill="none"
        stroke="rgba(254, 240, 138, 0.3)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Vertex Micro-Rivets / Chronometer Alignment Pips */}
      <circle cx="50" cy="6" r="2.2" fill="#FEF08A" />
      <circle cx="89" cy="28" r="2.2" fill="#FEF08A" />
      <circle cx="89" cy="72" r="2.2" fill="#FEF08A" />
      <circle cx="50" cy="94" r="2.2" fill="#FEF08A" />
      <circle cx="11" cy="72" r="2.2" fill="#FEF08A" />
      <circle cx="11" cy="28" r="2.2" fill="#FEF08A" />

      {/* Matrix Circuit Hairlines */}
      <line x1="50" y1="13" x2="50" y2="28" stroke="rgba(234, 179, 8, 0.45)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="72" x2="50" y2="87" stroke="rgba(234, 179, 8, 0.45)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17" y1="50" x2="31" y2="50" stroke="rgba(234, 179, 8, 0.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="69" y1="50" x2="83" y2="50" stroke="rgba(234, 179, 8, 0.35)" strokeWidth="1.2" strokeLinecap="round" />

      {/* ========================================================
          ICONIC FACETED 3D "K" MONOGRAM (KAROMETA CORE)
          ======================================================== */}

      {/* 1. Vertical Gold Pillar (Left Stem of "K") */}
      <path
        d="M 31 27 L 41 27 L 41 73 L 31 73 Z"
        fill="url(#karo-gold-primary)"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="0.8"
      />
      {/* Pillar Specular Reflection Lip */}
      <line x1="32.5" y1="28" x2="32.5" y2="72" stroke="url(#karo-specular-light)" strokeWidth="1.2" />

      {/* 2. Upper Diagonal Wing of "K" */}
      {/* Top Bright Bevel */}
      <path
        d="M 41 46 L 68 25 L 75 30 L 46 51 Z"
        fill="url(#karo-gold-primary)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="0.8"
      />
      {/* Bottom Shaded Bevel for 3D Depth */}
      <path
        d="M 46 51 L 75 30 L 70 38 L 44 56 Z"
        fill="url(#karo-gold-dark)"
      />

      {/* 3. Lower Diagonal Wing of "K" */}
      {/* Top Facet */}
      <path
        d="M 43 49 L 75 70 L 68 76 L 40 57 Z"
        fill="url(#karo-gold-primary)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="0.8"
      />
      {/* Bottom Depth Shadow */}
      <path
        d="M 40 57 L 68 76 L 62 76 L 37 59 Z"
        fill="url(#karo-gold-dark)"
      />

      {/* 4. Central Quantum Energy Diamond (High-Frequency Core) */}
      <polygon
        points="44,43 51,50 44,57 37,50"
        fill="#FFFFFF"
        stroke="#FEF08A"
        strokeWidth="1.2"
        filter="url(#karo-core-flare)"
      />
      <circle cx="44" cy="50" r="2.2" fill="#FFFFFF" />
    </svg>
  </div>
);

export default NexusLogo;
