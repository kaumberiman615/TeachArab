import React from 'react';

export interface LogoIconProps {
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * Pure inline SVG icon of Teach Arab:
 * Navy squircle background, Pink speech bubble, White open book, Yellow star sparkle.
 * Scales cleanly from 16px to 512px+.
 */
export function LogoIcon({ size = 40, className = '', title = 'Teach Arab Logo' }: LogoIconProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 select-none ${className}`}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>
      <defs>
        {/* Subtle top-light gradient for 3D tactile feel */}
        <linearGradient id="ta-squircle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#143468" />
          <stop offset="100%" stopColor="#0A254D" />
        </linearGradient>
        <linearGradient id="ta-bubble-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF4F9A" />
          <stop offset="100%" stopColor="#FF3B8D" />
        </linearGradient>
      </defs>

      {/* 1. Background Squircle: Deep Navy (#0A254D) */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="24"
        fill="url(#ta-squircle-grad)"
      />
      {/* Subtle border for tactile depth */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="24"
        fill="none"
        stroke="#00B4D8"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />

      {/* 2. Speech Bubble: Primary Pink (#FF3B8D) with Navy outline */}
      <path
        d="M 50 18 C 71 18, 85 29, 85 44 C 85 59, 71 70, 52 70 C 47 70, 42 69, 37.5 66.8 C 28.5 74, 20.5 76, 19 76 C 18 76, 17.5 75, 18.2 74 C 21 69.5 22 65.5 21.2 62.5 C 16 57.5 13 51 13 44 C 13 29, 27 18, 50 18 Z"
        fill="url(#ta-bubble-grad)"
        stroke="#0A254D"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 3. Open Book: Pure White (#FFFFFF) */}
      {/* Left Page */}
      <path
        d="M 50 33 C 41.5 30.5 34.5 31.5 29.5 33.5 C 28.5 33.9 27.5 34.8 27.5 36.2 L 27.5 54.5 C 27.5 55.8 28.8 56.8 30 56.5 C 35.5 54.5 42.5 54 50 57 Z"
        fill="#FFFFFF"
        stroke="#0A254D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Right Page */}
      <path
        d="M 50 33 C 58.5 30.5 65.5 31.5 70.5 33.5 C 71.5 33.9 72.5 34.8 72.5 36.2 L 72.5 54.5 C 72.5 55.8 71.2 56.8 70 56.5 C 64.5 54.5 57.5 54 50 57 Z"
        fill="#FFFFFF"
        stroke="#0A254D"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Center spine division line */}
      <path
        d="M 50 33 L 50 57"
        stroke="#FF3B8D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Stylized Arabic page lines */}
      <path
        d="M 33 40 C 37 39, 42 39, 45.5 40.5"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 33 45 C 37 44, 42 44, 45.5 45.5"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 33 50 C 37 49, 42 49, 45.5 50.5"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />

      <path
        d="M 54.5 40.5 C 58 39, 63 39, 67 40"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 54.5 45.5 C 58 44, 63 44, 67 45"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 54.5 50.5 C 58 49, 63 49, 67 50"
        stroke="#FF3B8D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 4. Cheerful Sparkle Star: Bright Yellow (#FED034) */}
      <path
        d="M 80 8 C 80 14, 84 18, 90 18 C 84 18, 80 22, 80 28 C 80 22, 76 18, 70 18 C 76 18, 80 14, 80 8 Z"
        fill="#FED034"
        stroke="#0A254D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Little companion yellow bubble/sparkle */}
      <circle
        cx="67"
        cy="10"
        r="2.5"
        fill="#FED034"
        stroke="#0A254D"
        strokeWidth="1"
      />
    </svg>
  );
}

export interface LogoProps {
  variant?: 'icon' | 'full' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  themeMode?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export default function Logo({
  variant = 'full',
  size = 'md',
  themeMode = 'light',
  showTagline,
  className = '',
  iconClassName = '',
  onClick,
}: LogoProps) {
  // Resolve numeric size vs preset string
  let iconPx = 40;
  let textClass = 'text-xl';
  let taglineClass = 'text-[11px]';

  if (typeof size === 'number') {
    iconPx = size;
    if (size <= 24) {
      textClass = 'text-sm';
      taglineClass = 'text-[9px]';
    } else if (size <= 32) {
      textClass = 'text-base';
      taglineClass = 'text-[10px]';
    } else if (size <= 48) {
      textClass = 'text-xl';
      taglineClass = 'text-[11px]';
    } else {
      textClass = 'text-3xl';
      taglineClass = 'text-xs';
    }
  } else {
    switch (size) {
      case 'xs':
        iconPx = 22;
        textClass = 'text-xs';
        taglineClass = 'text-[9px]';
        break;
      case 'sm':
        iconPx = 30;
        textClass = 'text-sm sm:text-base';
        taglineClass = 'text-[10px]';
        break;
      case 'md':
        iconPx = 42;
        textClass = 'text-lg sm:text-xl';
        taglineClass = 'text-[11px]';
        break;
      case 'lg':
        iconPx = 54;
        textClass = 'text-2xl sm:text-3xl';
        taglineClass = 'text-xs sm:text-sm';
        break;
      case 'xl':
        iconPx = 76;
        textClass = 'text-3xl sm:text-4xl';
        taglineClass = 'text-sm sm:text-base';
        break;
    }
  }

  // Tagline visibility
  const shouldShowTagline =
    showTagline !== undefined ? showTagline : variant === 'full' && size !== 'xs';

  // Contrast text color based on themeMode
  const teachColor = themeMode === 'dark' ? 'text-white' : 'text-[#0A254D]';
  const taglineColor = themeMode === 'dark' ? 'text-white/70' : 'text-stone-500';

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} onClick={onClick}>
        <LogoIcon size={iconPx} className={iconClassName} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none text-left ${className}`}
    >
      <LogoIcon size={iconPx} className={`shadow-xs ${iconClassName}`} />
      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-tight ${textClass} ${teachColor}`}>
          Teach<span className="text-[#FF3B8D]">Arab</span>
        </span>
        {shouldShowTagline && (
          <span className={`font-bold tracking-tight leading-tight ${taglineClass} ${taglineColor}`}>
            Materi & Game Interaktif
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Generates raw SVG string for self-contained offline HTML exports
 */
export function getLogoSvgString(size: number = 32): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Teach Arab">
    <rect x="4" y="4" width="92" height="92" rx="24" fill="#0A254D"/>
    <rect x="4" y="4" width="92" height="92" rx="24" fill="none" stroke="#00B4D8" stroke-width="1.5" stroke-opacity="0.3"/>
    <path d="M 50 18 C 71 18, 85 29, 85 44 C 85 59, 71 70, 52 70 C 47 70, 42 69, 37.5 66.8 C 28.5 74, 20.5 76, 19 76 C 18 76, 17.5 75, 18.2 74 C 21 69.5 22 65.5 21.2 62.5 C 16 57.5 13 51 13 44 C 13 29, 27 18, 50 18 Z" fill="#FF3B8D" stroke="#0A254D" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 50 33 C 41.5 30.5 34.5 31.5 29.5 33.5 C 28.5 33.9 27.5 34.8 27.5 36.2 L 27.5 54.5 C 27.5 55.8 28.8 56.8 30 56.5 C 35.5 54.5 42.5 54 50 57 Z" fill="#FFFFFF" stroke="#0A254D" stroke-width="2" stroke-linejoin="round"/>
    <path d="M 50 33 C 58.5 30.5 65.5 31.5 70.5 33.5 C 71.5 33.9 72.5 34.8 72.5 36.2 L 72.5 54.5 C 72.5 55.8 71.2 56.8 70 56.5 C 64.5 54.5 57.5 54 50 57 Z" fill="#FFFFFF" stroke="#0A254D" stroke-width="2" stroke-linejoin="round"/>
    <path d="M 50 33 L 50 57" stroke="#FF3B8D" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 33 40 C 37 39, 42 39, 45.5 40.5" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 33 45 C 37 44, 42 44, 45.5 45.5" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 33 50 C 37 49, 42 49, 45.5 50.5" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 54.5 40.5 C 58 39, 63 39, 67 40" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 54.5 45.5 C 58 44, 63 44, 67 45" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 54.5 50.5 C 58 49, 63 49, 67 50" stroke="#FF3B8D" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
    <path d="M 80 8 C 80 14, 84 18, 90 18 C 84 18, 80 22, 80 28 C 80 22, 76 18, 70 18 C 76 18, 80 14, 80 8 Z" fill="#FED034" stroke="#0A254D" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="67" cy="10" r="2.5" fill="#FED034" stroke="#0A254D" stroke-width="1"/>
  </svg>`;
}
