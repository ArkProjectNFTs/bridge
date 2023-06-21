"use client";

import Image from "next/image";
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
        className="mx-auto mb-23 mt-12 flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-6 py-5"
        onClick={openModal}
      >
        <Image
          src="/icons/wallet_small.svg"
          height={32}
          width={32}
          alt="wallet icon"
        />
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
