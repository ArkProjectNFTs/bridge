"use client";

import * as React from "react";

interface IconButtonProps {
  onClick: () => void;
}

export function IconButton({ onClick }: IconButtonProps) {
  return (
    <button
      className="bg-primary h-8 w-8 rounded-full p-7"
      onClick={onClick}
    ></button>
  );
}
