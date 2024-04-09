interface MinusIconProps {
  className?: string;
}

export function MinusIcon({ className }: MinusIconProps) {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      className={className}
    >
      <path
        d="M16.6667 11.3334H3.33333C3.11232 11.3334 2.90036 11.2456 2.74408 11.0893C2.5878 10.9331 2.5 10.7211 2.5 10.5001C2.5 10.2791 2.5878 10.0671 2.74408 9.91083C2.90036 9.75455 3.11232 9.66675 3.33333 9.66675H16.6667C16.8877 9.66675 17.0996 9.75455 17.2559 9.91083C17.4122 10.0671 17.5 10.2791 17.5 10.5001C17.5 10.7211 17.4122 10.9331 17.2559 11.0893C17.0996 11.2456 16.8877 11.3334 16.6667 11.3334Z"
        fill="currentColor"
        stroke="currentColor"
      />
    </svg>
  );
}
