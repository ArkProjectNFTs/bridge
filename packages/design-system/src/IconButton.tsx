"use client";

interface IconButtonProps {
  className?: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export function IconButton({ className, icon, onClick }: IconButtonProps) {
  return (
    <button
      className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${className}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
