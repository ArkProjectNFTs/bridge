interface TwitterIconProps {
  className?: string;
}

export function TwitterIcon({ className }: TwitterIconProps) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="currentColor" />
      <path
        d="M21.2726 7.41992H24.0838L17.9421 14.4395L25.1673 23.9916H19.51L15.079 18.1983L10.0089 23.9916H7.19601L13.7652 16.4833L6.83398 7.41992H12.6349L16.6401 12.7152L21.2726 7.41992ZM20.2859 22.3089H21.8436L11.7885 9.0142H10.1169L20.2859 22.3089Z"
        fill="#071117"
      />
    </svg>
  );
}
