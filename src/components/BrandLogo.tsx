import React from 'react';

export const BrandLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* High-visibility pure neon cyan to electric blue gradient */}
        <linearGradient id="logo-left-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        
        {/* Deep electric blue to high-end purple/violet gradient */}
        <linearGradient id="logo-right-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Dynamic diagonal connection crossbar gradient with highlight stop */}
        <linearGradient id="logo-diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Subtle drop shadow/glow filter to add incredible luxury tech depth */}
        <filter id="logo-subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#logo-subtle-glow)">
        {/* Outer security perimeter - micro-dots & structural frame */}
        <polygon 
          points="100,15 175,55 175,145 100,185 25,145 25,55" 
          stroke="url(#logo-left-pillar)" 
          strokeWidth="1.5" 
          strokeDasharray="4 6" 
          opacity="0.35"
        />

        {/* Structural Isometric Nodes / Anchors */}
        <circle cx="100" cy="15" r="2.5" fill="#00E5FF" opacity="0.8" />
        <circle cx="175" cy="55" r="2.5" fill="#3B82F6" opacity="0.8" />
        <circle cx="175" cy="145" r="2.5" fill="#8B5CF6" opacity="0.8" />
        <circle cx="100" cy="185" r="2.5" fill="#8B5CF6" opacity="0.8" />
        <circle cx="25" cy="145" r="2.5" fill="#3B82F6" opacity="0.8" />
        <circle cx="25" cy="55" r="2.5" fill="#00E5FF" opacity="0.8" />

        {/* Primary Overlapping Isometric Slabs */}
        {/* Left Core Pillar: Represents secure distributed nodes */}
        <path 
          d="M50 65 L85 45 L85 135 L50 155 Z" 
          fill="url(#logo-left-pillar)" 
          opacity="0.95"
          className="transition-all duration-300 hover:opacity-100"
        />
        {/* Inner high-contrast panel edge */}
        <path 
          d="M55 71 L80 57 L80 128 L55 142 Z" 
          fill="#05070A" 
          opacity="0.4"
        />

        {/* Central Interlocking Cross-Plate representing Ledger Synchronization */}
        <path 
          d="M85 45 L115 135 L115 155 L85 65 Z" 
          fill="url(#logo-diagonal)"
          opacity="0.85"
        />

        {/* Right Core Pillar: Represents client application clusters */}
        <path 
          d="M115 65 L150 45 L150 135 L115 155 Z" 
          fill="url(#logo-right-pillar)" 
          opacity="0.95"
        />
        <path 
          d="M120 71 L145 57 L145 128 L120 142 Z" 
          fill="#05070A" 
          opacity="0.4"
        />

        {/* Fine-line circuit/data pipelines cutting through */}
        <line x1="85" y1="45" x2="115" y2="65" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        <line x1="85" y1="135" x2="115" y2="155" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        <line x1="50" y1="65" x2="150" y2="135" stroke="#00E5FF" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.5" />
        <line x1="50" y1="155" x2="150" y2="85" stroke="#8B5CF6" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.5" />

        {/* High-Performance central core: a nested quantum well */}
        <polygon 
          points="100,82 118,92 118,112 100,122 82,112 82,92"
          fill="#05070A"
          stroke="url(#logo-diagonal)"
          strokeWidth="3"
        />
        <polygon 
          points="100,88 112,95 112,109 100,116 88,109 88,95"
          fill="url(#logo-left-pillar)"
          opacity="0.2"
        />

        <circle 
          cx="100" 
          cy="102" 
          r="8" 
          fill="#04060A" 
          stroke="#00E5FF" 
          strokeWidth="2.5" 
        />
        <circle 
          cx="100" 
          cy="102" 
          r="3" 
          fill="#00E5FF" 
          className="animate-pulse"
        />
      </g>
    </svg>
  );
};
