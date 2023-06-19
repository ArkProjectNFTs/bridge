"use client";

interface IconButtonProps {
  icon: React.ReactElement;
  onClick: () => void;
}

export function IconButton({ icon, onClick }: IconButtonProps) {
  return (
    <button
      className="bg-primary-50 flex h-8 w-8 items-center justify-center rounded-full text-white"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
