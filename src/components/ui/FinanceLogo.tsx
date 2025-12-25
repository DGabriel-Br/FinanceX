import { cn } from "@/lib/utils";

interface FinanceLogoProps {
  className?: string;
  size?: number;
}

export const FinanceLogo = ({ className, size = 40 }: FinanceLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]", className)}
    >
      <defs>
        <linearGradient id="fGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      
      {/* Main F body */}
      <path
        d="M20 95 L20 20 L35 5 L70 5 L70 20 L40 20 L40 42 L65 42 L65 57 L40 57 L40 95 Z"
        fill="url(#fGradient)"
      />
      
      {/* Arrow pointing up-right */}
      <path
        d="M60 5 L85 5 L85 30 L75 30 L75 20 L60 20 Z"
        fill="url(#arrowGradient)"
      />
      <path
        d="M70 5 L90 5 L70 25 Z"
        fill="url(#arrowGradient)"
      />
    </svg>
  );
};
