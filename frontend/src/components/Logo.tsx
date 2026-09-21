interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div
      className={`logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        userSelect: "none",
      }}
    >
      {/* Vector Shield Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(16, 185, 129, 0.25))" }}
      >
        <defs>
          <linearGradient id="reactShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
          <linearGradient id="reactCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Badge ground */}
        <rect width="100" height="100" rx="24" fill="#0F172A" />
        <rect x="1.5" y="1.5" width="97" height="97" rx="22.5" stroke="#1E293B" strokeWidth="3" />

        {/* Outer Cryptographic Shield */}
        <path
          d="M50 14 L78 26 C78 52 66 74 50 86 C34 74 22 52 22 26 Z"
          fill="url(#reactShieldGrad)"
          opacity="0.18"
        />
        <path
          d="M50 14 L78 26 C78 52 66 74 50 86 C34 74 22 52 22 26 Z"
          stroke="url(#reactShieldGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner ZK Key / Geometric Node */}
        <path
          d="M50 30 L66 38 C66 56 58 70 50 78 C42 70 34 56 34 38 Z"
          fill="#0B132B"
          stroke="url(#reactCoreGrad)"
          strokeWidth="2.5"
        />

        {/* Keyhole Node */}
        <circle cx="50" cy="46" r="6" fill="#F8FAFC" />
        <path d="M47.5 50 L52.5 50 L54 62 L46 62 Z" fill="#F8FAFC" />
        <circle cx="50" cy="46" r="3" fill="#10B981" />

        {/* Circuit dots */}
        <circle cx="50" cy="22" r="2.5" fill="#34D399" />
        <circle cx="68" cy="30" r="2.5" fill="#38BDF8" />
        <circle cx="32" cy="30" r="2.5" fill="#38BDF8" />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: `${Math.max(1.1, size * 0.045)}rem`,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          PrivPass
        </span>
      )}
    </div>
  );
}
