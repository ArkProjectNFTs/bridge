"use client";

import { Typography } from "design-system";
import { useState } from "react";
import ConnectModal from "../bridge/components/ConnectModal";

export default function ConnectWalletsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="mb-23 mt-12 rounded-full bg-sky-950 px-6 py-5"
        onClick={openModal}
      >
        <Typography variant="body_text_bold_16" className="text-white">
          Connect wallets
        </Typography>
      </button>
      <ConnectModal
        // key used to reset the internal states of ConnectModal when isModalOpen changes
        key={isModalOpen ? "open" : "closed"}
        isOpen={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      />
    </>
  );
}
