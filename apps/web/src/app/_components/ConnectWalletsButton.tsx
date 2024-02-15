"use client";

import { Typography } from "design-system";
import { useState } from "react";

import ConnectModal from "./ConnectModal";

export default function ConnectWalletsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="mx-auto flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-space-blue-source px-9 dark:bg-space-blue-source sm:w-auto"
        onClick={openModal}
      >
        <Typography
          className="text-white dark:text-black"
          variant="button_text_l"
        >
          Start now
        </Typography>
      </button>
      <ConnectModal
        isOpen={isModalOpen}
        // key used to reset the internal states of ConnectModal when isModalOpen changes
        key={isModalOpen ? "open" : "closed"}
        onOpenChange={(open) => setIsModalOpen(open)}
      />
    </>
  );
}
