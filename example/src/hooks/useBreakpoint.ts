import { useWindowDimensions } from 'react-native';
import { useCSSVariable } from 'uniwind';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'xl' | '2xl';

const DEFAULT_BREAKPOINTS: Record<Breakpoint, number> = {
  'xs': 375,
  'sm': 390,
  'md': 768,
  'xl': 744,
  '2xl': 1024,
};

function parseBreakpoint(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return fallback;
}

/**
 * Responsive breakpoint hook using Uniwind CSS variables (`--breakpoint-*`).
 * Reads runtime breakpoint definitions from global.css or falls back to defaults.
 *
 * @param breakpoint The target breakpoint ('xs' | 'sm' | 'md' | 'xl' | '2xl')
 * @returns True if current window width is greater than or equal to the breakpoint width.
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useWindowDimensions();
  const cssValue = useCSSVariable(`--breakpoint-${breakpoint}`);
  const resolved = parseBreakpoint(cssValue, DEFAULT_BREAKPOINTS[breakpoint]);

  return width >= resolved;
}
