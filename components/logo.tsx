// SHAPESHIFTERS Logo Component - Triangular interlocking S design (official brand logo)
// The geometric triangular mark with interlocking S shapes

interface LogoProps {
  className?: string
  variant?: 'full' | 'icon'
}

export function ShapeshiftersLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 90" 
      className={className}
      fill="currentColor"
      aria-label="SHAPESHIFTERS logo"
    >
      {/* Triangular interlocking S/W logo - the official SHAPESHIFTERS mark */}
      {/* Left outer edge of triangle */}
      <polygon points="50,0 0,87 12,87 50,18" />
      {/* Right outer edge of triangle */}
      <polygon points="50,0 100,87 88,87 50,18" />
      {/* Left inner diagonal - creates the S weave */}
      <polygon points="25,45 37,45 68,87 56,87" />
      {/* Right inner diagonal - creates the S weave */}
      <polygon points="75,45 63,45 32,87 44,87" />
      {/* Center diamond cutout effect - white space */}
      <polygon points="50,38 62,58 50,78 38,58" fill="var(--background, #fff)" />
      {/* Bottom point of triangle */}
      <polygon points="44,87 50,87 56,87 50,78" />
    </svg>
  )
}

export function Logo({ className = "", variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return <ShapeshiftersLogo className={className || "h-10 w-10"} />
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ShapeshiftersLogo className="h-11 w-11" />
      <span 
        className="text-xl font-bold tracking-[0.25em] uppercase"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        SHAPESHIFTERS
      </span>
    </div>
  )
}
