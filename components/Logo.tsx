import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 200 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Left Circle (White with Orange Border) */}
      <circle cx="65" cy="60" r="50" fill="white" stroke="#f97316" strokeWidth="6" />
      
      {/* Text "SD-Con" - Rotated */}
      <text 
        x="45" 
        y="65" 
        fontFamily="Arial, sans-serif" 
        fontWeight="bold" 
        fontSize="32" 
        fill="#ffffff" 
        stroke="#f97316" 
        strokeWidth="1.5"
        transform="rotate(-90, 45, 60)"
        style={{ pointerEvents: 'none' }}
      >
        SD-Con
      </text>
      
       {/* Text "SD-Con" filled inside */}
       <g transform="translate(65, 60) rotate(-90)">
         <text 
          x="0" 
          y="5" 
          textAnchor="middle" 
          fontFamily="'Kanit', sans-serif" 
          fontWeight="900" 
          fontSize="28" 
          fill="none"
          stroke="#f97316" 
          strokeWidth="2"
        >
          SD-Con
        </text>
      </g>

      {/* Right Circle (Orange) */}
      <circle cx="135" cy="60" r="50" fill="#f97316" stroke="white" strokeWidth="2" />
      
      {/* Clock/Design Details on Right Circle */}
      {/* Vertical Line */}
      <line x1="135" y1="20" x2="135" y2="60" stroke="white" strokeWidth="6" strokeLinecap="round" />
      {/* Center Dot */}
      <circle cx="135" cy="60" r="12" fill="white" />
      {/* Bottom Sector (White Triangle/Sector effect) */}
      <path d="M135 60 L115 105 A 50 50 0 0 0 155 105 Z" fill="white" fillOpacity="0.2" />
      <path d="M135 60 L125 108 L145 108 Z" fill="white" />

      {/* Center connector dot (optional, for style) */}
      <circle cx="100" cy="60" r="8" fill="#f97316" stroke="white" strokeWidth="2" />
      <circle cx="100" cy="60" r="4" fill="white" />
    </svg>
  );
};