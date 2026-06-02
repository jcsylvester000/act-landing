'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
}

export function useBreakpoint() {
  // SSR-safe defaults (assume desktop)
  const [bp, setBp] = useState<Breakpoint>('lg');
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    // Initialize with actual window values after mount
    setBp(getBreakpoint(window.innerWidth));
    setWidth(window.innerWidth);

    let raf: number;
    const handler = () => {
      raf = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
        setBp(getBreakpoint(window.innerWidth));
      });
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  return {
    bp,
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isXs: width < BREAKPOINTS.sm,
    isSm: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
  };
}

export function r<T>(
  values: { mobile: T; tablet?: T; desktop?: T },
  bp: Breakpoint
): T {
  if (bp === 'xs' || bp === 'sm') return values.mobile;
  if (bp === 'md') return values.tablet ?? values.mobile;
  return values.desktop ?? values.tablet ?? values.mobile;
}
