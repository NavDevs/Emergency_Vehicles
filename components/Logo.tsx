'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background gradient */}
      <rect
        width="100"
        height="100"
        rx="20"
        fill="url(#logoGradient)"
      />
      
      {/* Traffic light body */}
      <rect
        x="35"
        y="15"
        width="30"
        height="70"
        rx="4"
        fill="#1F2937"
        stroke="white"
        strokeWidth="2"
      />
      
      {/* Red light */}
      <circle
        cx="50"
        cy="28"
        r="8"
        fill="#EF4444"
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Yellow light */}
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="#F59E0B"
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Green light - glowing */}
      <circle
        cx="50"
        cy="72"
        r="8"
        fill="#22C55E"
        stroke="white"
        strokeWidth="1.5"
      >
        <animate
          attributeName="opacity"
          values="1;0.7;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* EV Badge */}
      <circle
        cx="75"
        cy="25"
        r="12"
        fill="#0052FF"
        stroke="white"
        strokeWidth="2"
      />
      <text
        x="75"
        y="29"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="bold"
      >
        EV
      </text>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="logoGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0052FF" />
          <stop offset="100%" stopColor="#4D7CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Simple icon version for favicon-like usage
export function LogoIcon({ size = 24, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="20" fill="#0052FF" />
      <rect x="35" y="15" width="30" height="70" rx="4" fill="#1F2937" />
      <circle cx="50" cy="28" r="8" fill="#EF4444" />
      <circle cx="50" cy="50" r="8" fill="#F59E0B" />
      <circle cx="50" cy="72" r="8" fill="#22C55E" />
      <circle cx="75" cy="25" r="12" fill="white" />
      <text x="75" y="29" textAnchor="middle" fill="#0052FF" fontSize="10" fontWeight="bold">EV</text>
    </svg>
  );
}
