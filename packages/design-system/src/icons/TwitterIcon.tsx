interface TwitterIconProps {
  className?: string;
}

export function TwitterIcon({ className }: TwitterIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="currentColor" />
    </svg>
  );
}
