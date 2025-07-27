import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Smiley Face Icon */}
      <svg 
        className={`${sizeClasses[size]} w-auto`} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Eyes */}
        <circle cx="12" cy="15" r="3" fill="#3B82F6" />
        <circle cx="28" cy="15" r="3" fill="#3B82F6" />
        
        {/* Smile */}
        <path 
          d="M12 25 Q20 32 28 25" 
          stroke="#3B82F6" 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="none"
        />
      </svg>
      
      {/* Text */}
      <span className={`font-bold text-gray-900 ${
        size === 'sm' ? 'text-lg' : 
        size === 'md' ? 'text-xl sm:text-2xl' : 
        'text-2xl sm:text-3xl'
      }`}>
        DoeAgora
      </span>
    </div>
  )
}
