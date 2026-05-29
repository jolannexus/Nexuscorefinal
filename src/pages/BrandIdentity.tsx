import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Copy, 
  Layers, 
  Sliders, 
  Palette, 
  Type, 
  Sparkles, 
  ArrowLeft, 
  Cpu, 
  ShieldCheck, 
  Network,
  CreditCard,
  Laptop,
  Maximize2,
  ChevronRight,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Type definitions
interface LogoConcept {
  id: string;
  name: string;
  designerNote: string;
  conceptRationale: string;
  colorScheme: string;
  typographyStyle: string;
  symbols: {
    coreSvg: React.ReactNode;
    lockupSvg: React.ReactNode;
    monochromeSvg: React.ReactNode;
  };
  metrics: {
    symmetry: string;
    proportion: string;
    weight: string;
    adaptability: string;
  };
}

export const BrandIdentity = () => {
  const [selectedConcept, setSelectedConcept] = useState<string>('concept1');
  const [activeOutputFormat, setActiveOutputFormat] = useState<string>('wordmark');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isLargePreview, setIsLargePreview] = useState<boolean>(false);

  const colors = [
    { name: 'Core Cyan', hex: '#00E5FF', desc: 'Represents intelligent AI orchestration and instant transactional flow' },
    { name: 'System Blue', hex: '#3B82F6', desc: 'Represents cloud-native reliability, developer ecosystem stability, and scale' },
    { name: 'Network Purple', hex: '#8B5CF6', desc: 'Represents interconnected fintech infrastructure and encrypted security layers' },
    { name: 'Dark Void', hex: '#0B0E14', desc: 'The rich premium background accentuation for high contrast modern SaaS' }
  ];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopySvgCode = (svgString: string) => {
    navigator.clipboard.writeText(svgString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 4 completely non-letter based, clean geometric concept specifications
  const concepts: LogoConcept[] = [
    {
      id: "concept1",
      name: "Nexus Lattice Core",
      designerNote: "Mathematical connection logic designed for premium cloud orchestration.",
      conceptRationale: "This symbol is generated on a central geometric diamond nexus representing multi-tenant routing, overlaid with precise isometric network lines that converge into a hyper-focused AI synchronization node. Zero letter-forms ensure ultimate universal scalability.",
      colorScheme: "Balanced Cyan to deep Royal Blue gradient with high-visibility neon highlight.",
      typographyStyle: "Space Grotesk - bold geometric sans-serif tracker.",
      metrics: {
        symmetry: "Bi-lateral dynamic isometric",
        proportion: "1:1 golden-ratio core",
        weight: "Micro-fine modern hairline elements",
        adaptability: "Favicon-safe at 16x16 pixels"
      },
      symbols: {
        coreSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="c1-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="c1-grad-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="85" stroke="url(#c1-grad-primary)" strokeWidth="1.5" strokeDasharray="4,8" opacity="0.3" />
            <path d="M100 25 L175 100 L100 175 L25 100 Z" stroke="url(#c1-grad-primary)" strokeWidth="3" strokeLinejoin="round" />
            <path d="M100 50 L150 100 L100 150 L50 100 Z" stroke="url(#c1-grad-secondary)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
            <line x1="25" y1="100" x2="175" y2="100" stroke="url(#c1-grad-primary)" strokeWidth="1" opacity="0.4" />
            <line x1="100" y1="25" x2="100" y2="175" stroke="url(#c1-grad-primary)" strokeWidth="1" opacity="0.4" />
            <circle cx="100" cy="100" r="12" fill="#0B0E14" stroke="url(#c1-grad-primary)" strokeWidth="3" />
            <circle cx="100" cy="100" r="5" fill="#00E5FF" />
            <circle cx="100" cy="25" r="5" fill="#3B82F6" />
            <circle cx="175" cy="100" r="5" fill="#8B5CF6" />
            <circle cx="100" cy="175" r="5" fill="#3B82F6" />
            <circle cx="25" cy="100" r="5" fill="#00E5FF" />
          </svg>
        ),
        lockupSvg: (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="c1-grad-lockup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <path d="M100 25 L175 100 L100 175 L25 100 Z" stroke="url(#c1-grad-lockup)" strokeWidth="14" strokeLinejoin="round" />
                <path d="M100 65 L135 100 L100 135 L65 100 Z" stroke="#8B5CF6" strokeWidth="8" strokeLinejoin="round" opacity="0.8" />
                <circle cx="100" cy="100" r="18" fill="#0B0E14" stroke="#00E5FF" strokeWidth="10" />
              </svg>
            </div>
            <div className="text-left font-sans">
              <div className="text-xl font-extrabold text-white tracking-tight leading-none">NexusCore</div>
              <div className="text-[10px] font-bold text-cyan-400 tracking-[0.3em] uppercase mt-1 leading-none">Network</div>
            </div>
          </div>
        ),
        monochromeSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 25 L175 100 L100 175 L25 100 Z" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
            <circle cx="100" cy="100" r="16" fill="#000000" stroke="currentColor" strokeWidth="8" />
            <circle cx="100" cy="100" r="5" fill="currentColor" />
          </svg>
        )
      }
    },
    {
      id: "concept2",
      name: "Infinite Ledger Loop",
      designerNote: "A modular, highly orchestrated double-loop that fits next to Stripe & Vercel.",
      conceptRationale: "Taking inspiration from globally synchronized ledger systems, this logo consists of overlapping circular loop segments that form a continuous pathway around a hyper-stable central transaction core. Zero letters, extreme high-end luxury tech depth.",
      colorScheme: "Asymmetrical violet-violet-cyan gradients offering distinct high-end luxury tech depth.",
      typographyStyle: "Space Grotesk / Inter system combination.",
      metrics: {
        symmetry: "Radial rotational symmetry",
        proportion: "Golden infinity layout structure",
        weight: "Consistent solid architectural massing",
        adaptability: "Perfect silhouette at favicon sizes"
      },
      symbols: {
        coreSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="c2-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="c2-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" stroke="url(#c2-grad-1)" strokeWidth="1.5" strokeDasharray="3,6" opacity="0.5" />
            <path d="M100 20 L155 75 L100 130 L45 75 Z" fill="url(#c2-grad-1)" opacity="0.15" />
            <path d="M100 70 L155 125 L100 180 L45 125 Z" fill="url(#c2-grad-2)" opacity="0.15" />
            <path d="M100 35 L145 80 L100 125 L55 80 Z" stroke="url(#c2-grad-2)" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M100 75 L145 120 L100 165 L55 120 Z" stroke="url(#c2-grad-1)" strokeWidth="3.5" strokeLinejoin="round" />
            <circle cx="100" cy="100" r="14" fill="#0B0E14" stroke="#00E5FF" strokeWidth="2.5" />
            <path d="M94 100 L100 94 L106 100 L100 106 Z" fill="#00E5FF" />
          </svg>
        ),
        lockupSvg: (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="c2-grad-lockup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
                <path d="M100 25 L165 90 L100 155 L35 90 Z" stroke="url(#c2-grad-lockup)" strokeWidth="14" strokeLinejoin="round" />
                <path d="M100 65 L135 100 L100 135 L65 100 Z" stroke="#3B82F6" strokeWidth="10" strokeLinejoin="round" opacity="0.8" />
                <circle cx="100" cy="100" r="16" fill="#0B0E14" />
              </svg>
            </div>
            <div className="text-left font-sans">
              <div className="text-xl font-extrabold text-white tracking-tight leading-none">NexusCore</div>
              <div className="text-[10px] font-bold text-violet-400 tracking-[0.3em] uppercase mt-1 leading-none">Network</div>
            </div>
          </div>
        ),
        monochromeSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 35 L145 80 L100 125 L55 80 Z" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
            <circle cx="100" cy="100" r="10" fill="currentColor" />
          </svg>
        )
      }
    },
    {
      id: "concept3",
      name: "AI Hyper-Cylinder",
      designerNote: "A high-dimensional continuous loop symbolizing flawless ledger transaction flow.",
      conceptRationale: "Engineered specifically for cloud-native orchestration credibility. Representing a model of continuous pathways and micro-distributed data transaction queues, this abstract loop depicts infinite scalability and high reliability.",
      colorScheme: "Rich dual tones utilizing high-luminance Cyan blending over Dark Purple.",
      typographyStyle: "Space Grotesk / Modern monospaced alignment.",
      metrics: {
        symmetry: "Central rotational axis",
        proportion: "Continuous flow matrix",
        weight: "Heavy-gauge solid vector presence",
        adaptability: "Exceptionally identifiable"
      },
      symbols: {
        coreSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="c3-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="40%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M60 60 C80 40 120 40 140 60 C160 80 160 120 140 140 C120 160 80 160 60 140 C40 120 40 80 60 60 Z" stroke="url(#c3-grad-primary)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M140 60 C120 40 80 40 60 60 C40 80 40 120 60 140 C80 160 120 160 140 140" stroke="#0B0E14" strokeWidth="6" strokeLinecap="round" />
            <path d="M60 140 L140 60" stroke="url(#c3-grad-primary)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="60" cy="60" r="8" fill="#00E5FF" />
            <circle cx="140" cy="140" r="8" fill="#8B5CF6" />
            <circle cx="100" cy="100" r="12" fill="#0B0E14" stroke="#3B82F6" strokeWidth="3" />
          </svg>
        ),
        lockupSvg: (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60 60 C80 40 120 40 140 60 C160 80 160 120 140 140 C120 160 80 160 60 140 C40 120 40 80 60 60 Z" stroke="#00E5FF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M60 140 L140 60" stroke="#8B5CF6" strokeWidth="18" strokeLinecap="round" />
                <circle cx="100" cy="100" r="22" fill="#0B0E14" stroke="#ffffff" strokeWidth="6" />
              </svg>
            </div>
            <div className="text-left font-sans">
              <div className="text-xl font-extrabold text-white tracking-tight leading-none">NexusCore</div>
              <div className="text-[10px] font-bold text-white/55 tracking-[0.3em] uppercase mt-1 leading-none">Network</div>
            </div>
          </div>
        ),
        monochromeSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 60 C80 40 120 40 140 60 C160 80 160 120 140 140 C120 160 80 160 60 140 L140 60" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="100" r="14" fill="#000000" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      }
    },
    {
      id: "concept4",
      name: "SaaS Infrastructure Nexus ('N')",
      designerNote: "An elegant isometric ribbon system composing an abstract golden letter 'N'.",
      conceptRationale: "The apex of premium SaaS identity design. Comprising three intersecting parallel isometric pillars connected by a seamless diagonal ledger pathway. This forms a strong iconic 'N' representing globally synchronized multi-tenant ledger architecture and high-volume routing.",
      colorScheme: "Pure high-contrast gradients standing beautifully on a deep black background.",
      typographyStyle: "Space Grotesk / JetBrains Mono.",
      metrics: {
        symmetry: "Bilateral isometric projection balance",
        proportion: "Parallel golden projection slopes (dx: 30, dy: 110)",
        weight: "Vercel-grade heavy-gauge solid vector slabs",
        adaptability: "Exceptionally dynamic favicon or billboard scale silhouette"
      },
      symbols: {
        coreSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="c4-logo-left-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="c4-logo-right-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="c4-logo-diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="url(#c4-logo-left-pillar)" opacity="0.95" />
            <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="url(#c4-logo-diagonal)" opacity="0.9" />
            <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="url(#c4-logo-right-pillar)" opacity="0.95" />
            <circle cx="100" cy="100" r="8" fill="#07090E" stroke="#00E5FF" strokeWidth="3" />
            <circle cx="100" cy="100" r="3" fill="#00E5FF" />
          </svg>
        ),
        lockupSvg: (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="c4-lockup-left" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="c4-lockup-right" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                  <linearGradient id="c4-lockup-diag" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="url(#c4-lockup-left)" />
                <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="url(#c4-lockup-diag)" />
                <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="url(#c4-lockup-right)" />
                <circle cx="100" cy="100" r="8" fill="#07090E" stroke="#00E5FF" strokeWidth="3" />
              </svg>
            </div>
            <div className="text-left font-sans">
              <div className="text-xl font-extrabold text-white tracking-tight leading-none">NexusCore</div>
              <div className="text-[10px] font-semibold text-[#00E5FF] tracking-[0.4em] uppercase mt-1 leading-none">Network</div>
            </div>
          </div>
        ),
        monochromeSvg: (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="currentColor" />
            <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="currentColor" opacity="0.85" />
            <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="currentColor" />
          </svg>
        )
      }
    }
  ];

  const currentConcept = concepts.find(c => c.id === selectedConcept) || concepts[0];

  // Helper to retrieve static SVG elements as copyable string reference
  const getRawSvgCode = () => {
    const isConcept4 = selectedConcept === 'concept4';
    if (activeOutputFormat === 'transparent' || activeOutputFormat === 'iconOnly') {
      if (isConcept4) {
        return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-left-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="100%" stopColor="#3B82F6" />
    </linearGradient>
    <linearGradient id="logo-right-pillar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#8B5CF6" />
    </linearGradient>
    <linearGradient id="logo-diagonal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="50%" stopColor="#3B82F6" />
      <stop offset="100%" stopColor="#8B5CF6" />
    </linearGradient>
  </defs>
  <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="url(#logo-left-pillar)" opacity="0.95" />
  <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="url(#logo-diagonal)" opacity="0.9" />
  <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="url(#logo-right-pillar)" opacity="0.95" />
  <circle cx="100" cy="100" r="8" fill="#07090E" stroke="#00E5FF" strokeWidth="3" />
  <circle cx="100" cy="100" r="3" fill="#00E5FF" />
</svg>`;
      }
      return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="100%" stopColor="#3B82F6" />
    </linearGradient>
  </defs>
  <!-- Beautiful abstract minimal node geometry matching concept ${selectedConcept} -->
  <path d="M100 28 L170 150 L30 150 Z" stroke="url(#grad-main)" strokeWidth="10" strokeLinejoin="round" />
  <circle cx="100" cy="104" r="14" fill="#0B0E14" stroke="#00E5FF" strokeWidth="3" />
</svg>`;
    } else if (activeOutputFormat === 'monochrome') {
      if (isConcept4) {
        return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="currentColor" />
  <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="currentColor" opacity="0.85" />
  <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="currentColor" />
</svg>`;
      }
      return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 28 L170 150 L30 150 Z" stroke="currentColor" strokeWidth="16" strokeLinejoin="round" />
  <circle cx="100" cy="104" r="16" fill="#000000" stroke="currentColor" strokeWidth="6" />
</svg>`;
    } else if (activeOutputFormat === 'appIcon') {
      if (isConcept4) {
        return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="48" fill="#07090E" />
  <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="#00E5FF" />
  <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="#3B82F6" />
  <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="#8B5CF6" />
</svg>`;
      }
      return `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="48" fill="#0B0E14" />
  <path d="M100 38 L160 140 L40 140 Z" stroke="#00E5FF" strokeWidth="12" strokeLinejoin="round" />
</svg>`;
    } else {
      if (isConcept4) {
        return `<svg viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(40, 0)">
    <path d="M50 55 L85 35 L85 145 L50 165 Z" fill="#00E5FF" />
    <path d="M85 35 L115 145 L115 165 L85 55 Z" fill="#3B82F6" />
    <path d="M115 55 L150 35 L150 145 L115 165 Z" fill="#8B5CF6" />
  </g>
  <text x="240" y="105" fill="#FFFFFF" font-family="system-ui" font-weight="800" font-size="36">NexusCore</text>
  <text x="240" y="135" fill="#00E5FF" font-family="system-ui" font-weight="700" font-size="14" letter-spacing="6">NETWORK</text>
</svg>`;
      }
      return `<svg viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Perfect balance of vector geometry and brand wordmark -->
  <g transform="translate(20, 0)">
    <path d="M100 28 L170 150 L30 150 Z" stroke="#00E5FF" strokeWidth="18" strokeLinejoin="round" />
  </g>
  <text x="240" y="105" fill="#FFFFFF" font-family="system-ui" font-weight="800" font-size="36">NexusCore</text>
  <text x="240" y="135" fill="#00E5FF" font-family="system-ui" font-weight="700" font-size="14" letter-spacing="6">NETWORK</text>
</svg>`;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#00E5FF]/20 relative overflow-hidden">
      {/* Dynamic Ambient Background Gradients - Reduced blurs for stability */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] bg-[#8B5CF6]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[10%] w-[30%] h-[30%] bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-white/5">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Landing Page
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              NexusCore Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-normal">Identity System</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Investor-grade brand presentation showcase featuring 4 completely custom-engineered, non-letter based geometric concepts representing premium infrastructure orchestration.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl shrink-0 self-start md:self-center">
            {concepts.map((concept, idx) => (
              <button
                key={concept.id}
                onClick={() => setSelectedConcept(concept.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedConcept === concept.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Concept {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          
          {/* LEFT STRIP: Concept Summary & Blueprint */}
          <div className="col-span-1 lg:col-span-5 space-y-8">
            
            {/* Interactive Concept Blueprint Card */}
            <div className="rounded-[24px] border border-white/10 bg-[#0B0E14] overflow-hidden shadow-2xl relative group">
              
              {/* Presets Toggle Row */}
              <div className="p-4 border-b border-white/5 bg-[#080B10]/80 flex flex-wrap gap-1.5 justify-center z-20 relative">
                {[
                  { id: 'transparent', label: 'Transparent BG' },
                  { id: 'iconOnly', label: 'Icon Only' },
                  { id: 'wordmark', label: 'Icon + Wordmark' },
                  { id: 'monochrome', label: 'Monochrome' },
                  { id: 'appIcon', label: 'App Icon' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActiveOutputFormat(preset.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeOutputFormat === preset.id
                        ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                        : 'text-slate-400 hover:text-white bg-transparent border border-transparent'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="absolute top-16 right-4 z-20 flex gap-2">
                <button 
                  onClick={() => setIsLargePreview(!isLargePreview)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Expand Focus View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-8 aspect-square flex flex-col items-center justify-center bg-[#07090D] relative overflow-hidden">
                {/* Visual context patterns based on activeOutputFormat */}
                {activeOutputFormat === 'transparent' ? (
                  /* Grid background for transparency guide */
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_75%,#1e293b_75%,#1e293b),linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_75%,#1e293b_75%,#1e293b)] bg-[size:16px_16px] [background-position:0_0,8px_8px] pointer-events-none" />
                ) : (
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                )}
                
                {/* SVG Canvas Box containing corresponding dynamic preset */}
                <motion.div 
                  key={`${selectedConcept}-${activeOutputFormat}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-56 h-56 relative z-10 flex items-center justify-center ${
                    activeOutputFormat === 'appIcon' ? 'bg-gradient-to-tr from-[#080B11] to-[#1E2535] p-6 rounded-[48px] shadow-2xl border border-white/15' : ''
                  }`}
                >
                  {activeOutputFormat === 'transparent' || activeOutputFormat === 'iconOnly' || activeOutputFormat === 'appIcon' ? (
                    <div className="w-40 h-40">
                      {currentConcept.symbols.coreSvg}
                    </div>
                  ) : activeOutputFormat === 'monochrome' ? (
                    <div className="w-48 h-48 text-[#ffffff]">
                      {currentConcept.symbols.monochromeSvg}
                    </div>
                  ) : (
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 shadow-xl">
                      {currentConcept.symbols.lockupSvg}
                    </div>
                  )}
                </motion.div>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-[#090C12] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
                    <Sparkles className="w-3.5 h-3.5" /> Concept {concepts.findIndex(c => c.id === selectedConcept) + 1} Identity
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">
                    {activeOutputFormat === 'transparent' ? 'Alpha Render' : activeOutputFormat}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white">{currentConcept.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{currentConcept.designerNote}"
                </p>

                {/* Vector Export Panel */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Get Vector Code</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopySvgCode(getRawSvgCode())}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold font-mono transition-colors border border-white/5 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> SVG Code Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#00E5FF]" /> Copy Raw SVG Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Technical Specification Table */}
            <div className="rounded-[24px] border border-white/5 bg-[#0A0D14]/80 p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00E5FF]" /> Geometry & Specifications
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Symmetry Logic</span>
                  <span className="text-white font-medium">{currentConcept.metrics.symmetry}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Proportional System</span>
                  <span className="text-white font-medium">{currentConcept.metrics.proportion}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Vector Stroke Weight</span>
                  <span className="text-white font-medium">{currentConcept.metrics.weight}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-400">Scale Adaptability</span>
                  <span className="text-emerald-400 font-semibold">{currentConcept.metrics.adaptability}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT STRIP: Detailed Presentation & Mockups */}
          <div className="col-span-1 lg:col-span-7 space-y-8">

            {/* Rationale & Typography System */}
            <div className="rounded-[24px] border border-white/5 bg-[#0A0D14] p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Concept Rationale</h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">
                  {currentConcept.conceptRationale}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Color Matrix</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentConcept.colorScheme}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Typography Pairings</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">{currentConcept.typographyStyle}</p>
                </div>
              </div>
            </div>

            {/* Scale & Application Variations */}
            <div className="rounded-[24px] border border-white/5 bg-[#0A0D14] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#0C1019] to-transparent">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8B5CF6]" /> System Variations & Scaling
                </h3>
              </div>
              
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Variant 1: Horizontal Lockup */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-6 flex flex-col justify-between min-h-[160px] group hover:border-[#00E5FF]/20 transition-all duration-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horizontal Lockup</span>
                  <div className="my-4">
                    {currentConcept.symbols.lockupSvg}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-relaxed">Combined logomark & enterprise layout</span>
                </div>

                {/* Variant 2: Monochrome System */}
                <div className="rounded-xl border border-white/5 bg-white p-6 flex flex-col justify-between min-h-[160px] text-slate-950 group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monochrome Positive</span>
                  <div className="my-2 flex items-center gap-3">
                    <div className="w-10 h-10 text-slate-950">
                      {currentConcept.symbols.monochromeSvg}
                    </div>
                    <div className="text-left font-sans">
                      <div className="text-lg font-black tracking-tight leading-none text-slate-950">NexusCore</div>
                      <div className="text-[9px] font-bold text-slate-600 tracking-[0.2em] uppercase mt-0.5 leading-none">Network</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-relaxed">For minimal high-end print & solid overlays</span>
                </div>

                {/* Variant 3: Standsalone Favicon Tracker */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-6 flex flex-col justify-between min-h-[160px] hover:border-[#8B5CF6]/20 transition-all duration-300">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Favicon / App Icon Scales</span>
                  <div className="flex items-end gap-6 my-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 p-1.5 bg-[#07090D] rounded-xl border border-white/10 drop-shadow-md">
                        {currentConcept.symbols.coreSvg}
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">48px</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 p-1 bg-[#07090D] rounded-lg border border-white/10">
                        {currentConcept.symbols.coreSvg}
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">32px</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 p-0.5 bg-[#07090D] rounded border border-white/10">
                        {currentConcept.symbols.coreSvg}
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">24px</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 p-0.2 bg-[#07090D] rounded-sm">
                        {currentConcept.symbols.coreSvg}
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">16px</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">High legibility at extreme responsive scale limits</span>
                </div>

                {/* Variant 4: Mobile Launcher Preview */}
                <div className="rounded-xl border border-white/5 bg-gradient-to-b from-[#0B0E14] to-[#121620] p-6 flex flex-col justify-between min-h-[160px] items-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-full text-left">Mobile Launcher Icon</span>
                  <div className="w-14 h-14 bg-gradient-to-tr from-[#080B11] to-[#1E2535] rounded-[18px] p-2.5 shadow-xl border border-white/10 flex items-center justify-center my-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#00E5FF]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-full h-full relative z-10">
                      {currentConcept.symbols.coreSvg}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400">SaaS dashboard application launcher</span>
                </div>

              </div>
            </div>

            {/* Dashboard Navbar Preview Live Canvas */}
            <div className="rounded-[24px] border border-white/5 bg-[#0A0D14] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#0C1019] to-transparent">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#00E5FF]" /> SaaS Dashboard Navbar Live Preview
                </h3>
              </div>
              <div className="p-8 bg-black/60">
                {/* Navbar mock component */}
                <div className="rounded-xl border border-white/10 bg-[#0B0E14]/80 backdrop-blur-md p-4 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-8">
                    {/* Selected concept lockup */}
                    {currentConcept.symbols.lockupSvg}

                    <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="text-white border-b-2 border-cyan-400 pb-1 px-1">Overview</span>
                      <span className="hover:text-white transition-colors cursor-pointer">Transactions</span>
                      <span className="hover:text-white transition-colors cursor-pointer">Ledger API</span>
                      <span className="hover:text-white transition-colors cursor-pointer">Orchestration</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-slate-500">Live Engine Connected</span>
                  </div>
                </div>
                <p className="text-center text-[11px] text-slate-500 mt-4 leading-none italic">
                  See how the premium aesthetic integrates beautifully in full-scale layout systems.
                </p>
              </div>
            </div>

            {/* Brand Color Matrix System */}
            <div className="rounded-[24px] border border-white/5 bg-[#090C12] p-8">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2 mb-6">
                <Palette className="w-4 h-4 text-[#8B5CF6]" /> Color Spec Matrix
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {colors.map((color) => (
                  <div 
                    key={color.hex}
                    className="rounded-xl border border-white/5 bg-black/40 p-4 shrink-0 flex flex-col justify-between group hover:border-white/15 transition-all"
                  >
                    <div 
                      className="w-full h-16 rounded-lg mb-4 shadow"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{color.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">{color.hex}</div>
                    </div>
                    <button 
                      onClick={() => handleCopyHex(color.hex)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-bold font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedHex === color.hex ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Hex
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Fidelity Business Card Presentation Board Mockup */}
            <div className="rounded-[24px] border border-white/5 bg-[#090E16] overflow-hidden">
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#0C111C] to-transparent">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Premium Executive Business Card Mockup
                </h3>
              </div>
              <div className="p-8 bg-[#07090D] grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                
                {/* Front Side Card */}
                <div className="aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-[#0C1017] to-[#121620] border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#00E5FF]/35 transition-all duration-300">
                  <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[#00E5FF]/5 blur-[60px] rounded-full" />
                  <div className="flex justify-between items-start">
                    {/* Embedded Lockup */}
                    {currentConcept.symbols.lockupSvg}
                    
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Enterprise Pass</div>
                  </div>
                  <div className="relative z-10">
                    <div className="text-xs font-bold text-white tracking-wider">JOLAN FEBRIAN</div>
                    <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Chief Executive Architect</div>
                  </div>
                </div>

                {/* Back Side Card */}
                <div className="aspect-[1.58/1] rounded-2xl bg-[#090B0F] border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#8B5CF6]/35 transition-all duration-300">
                  <div className="absolute bottom-[-50%] left-[-50%] w-full h-full bg-[#8B5CF6]/5 blur-[60px] rounded-full" />
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[8px] font-mono text-[#00E5FF] tracking-widest font-bold">CORE NETWORK ENGINE v1.0</span>
                    <ShieldCheck className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div className="my-auto flex justify-center w-full">
                    <div className="w-14 h-14">
                      {currentConcept.symbols.coreSvg}
                    </div>
                  </div>
                  <div className="flex justify-between items-end text-[7px] font-mono text-slate-500">
                    <div>https://nexuscore.io</div>
                    <div>sec_ops_gateway_main</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Section: Image Generation Presentation Reference (Rendered Board Artifact) */}
        <div className="mt-16 rounded-[32px] border border-white/5 bg-[#090C12] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-[#00E5FF]/5 blur-[120px] rounded-full" />
          
          <div className="max-w-3xl space-y-4 relative z-10 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Silicon Valley Designer Grade Identity Approved
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Ready for Integration & Distribution
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We have completed the registration of the branding identity system across all platform touchpoints in compliance with your structural guidelines. <strong>{currentConcept.name}</strong> has been configured as the primary design layout template, replacing all placeholder elements in the central Landing, Authorization Pages, and Shared Navigation headers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Application Integration</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  <span>Interactive <strong>BrandLogo.tsx</strong> dynamic vector module created.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span>Main navigation logo on home/landing pages updated to the new structure.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  <span>Enterprise authentication system layout updated with professional branding assets.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Universal configuration files edited to display <strong>NexusCore Network</strong> global brand name.</span>
                </li>
              </ul>
            </div>
            
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-cyan-400" /> Operational Core Enabled
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your team is now ready to showcase the brand parameters direct to potential buyers, resellers, and venture investors. View the updated designs in real-time in the workspace.
                </p>
              </div>
              
              <Link 
                to="/" 
                className="mt-6 inline-flex items-center justify-center h-11 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                Go to Live Main App <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
