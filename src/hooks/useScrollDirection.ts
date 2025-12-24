import { useState, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  disabled?: boolean;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 10, disabled = false } = options;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Check if at top
      setIsAtTop(scrollY < 10);
      
      // Only update direction if scroll difference is greater than threshold
      const scrollDiff = Math.abs(scrollY - lastScrollY.current);
      
      if (scrollDiff >= threshold) {
        const direction = scrollY > lastScrollY.current ? 'down' : 'up';
        setScrollDirection(direction);
        lastScrollY.current = scrollY;
      }
      
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Set initial values
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 10);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, disabled]);

  return { scrollDirection, isAtTop };
};
