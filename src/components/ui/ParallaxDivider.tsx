import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxDividerProps {
  direction: 'dark-to-light' | 'light-to-dark';
  className?: string;
}

export const ParallaxDivider = ({ direction, className }: ParallaxDividerProps) => {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!dividerRef.current) return;
      
      const rect = dividerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Create a parallax offset based on distance (subtle effect)
      const parallaxOffset = distanceFromCenter * 0.08;
      setOffset(parallaxOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDarkToLight = direction === 'dark-to-light';
  
  return (
    <div 
      ref={dividerRef}
      className={cn(
        "absolute -bottom-px left-0 right-0 h-20 lg:h-28 overflow-hidden pointer-events-none",
        className
      )}
    >
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-transform duration-100 ease-out",
          isDarkToLight 
            ? "from-transparent to-[#f8f9fb]" 
            : "from-transparent to-landing-dark"
        )}
        style={{ 
          clipPath: isDarkToLight 
            ? 'polygon(0 0, 100% 60%, 100% 100%, 0 100%)' 
            : 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)',
          transform: `translateY(${offset}px) scale(1.1)`,
        }}
      />
    </div>
  );
};
