interface LogoProps {
  stroke?: string;
}

/** The glasses-mark + "LHT / STORE" lockup shared by the nav and footer. */
export function Logo({ stroke = "#0a0a0a" }: LogoProps) {
  return (
    <svg width="52" height="17" viewBox="0 0 160 52" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="62" height="36" rx="14" stroke={stroke} strokeWidth="1.4" />
      <rect x="95" y="8" width="62" height="36" rx="14" stroke={stroke} strokeWidth="1.4" />
      <path d="M65 26 Q80 18 95 26" stroke={stroke} strokeWidth="1.4" fill="none" />
      <line x1="3" y1="22" x2="0" y2="19" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="157" y1="22" x2="160" y2="19" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
