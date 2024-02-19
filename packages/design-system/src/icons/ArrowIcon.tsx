interface ArrowIconProps {
  className?: string;
}

export function ArrowIcon({ className }: ArrowIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.75 12L11.2703 12C12.0987 12 12.7703 11.3284 12.7703 10.5L12.7703 7.56311C12.7703 6.93377 13.4987 6.58429 13.9896 6.97808L19.5207 11.415C19.895 11.7152 19.895 12.2848 19.5207 12.585L13.9896 17.0219C13.4987 17.4157 12.7703 17.0662 12.7703 16.4369L12.7703 14.625"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
