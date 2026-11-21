import { useRef } from 'react';

/**
 * A lightweight hook that tracks and returns the number of times the host component has rendered.
 * Starts at 1 on initial mount.
 *
 * @returns The total render count of the component.
 */
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
