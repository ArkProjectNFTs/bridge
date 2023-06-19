"use client";

import ConnectStarkNetButton from "./ConnectStarkNetButton";
import ConnectEthereumButton from "./ConnectEthereumButton";
import { useState } from "react";
import { type Chain } from "../helpers";
import { Typography } from "design-system";

export default function Header() {
  const [openedModal, setOpenedModal] = useState<Chain | undefined>(undefined);

  function openModal(chain: Chain) {
    setOpenedModal(chain);
  }

  function closeModal() {
    setOpenedModal(undefined);
  }

  return (
    <div className="fixed z-20 flex w-full items-center justify-between border-b border-neutral-50 bg-white p-6">
      <Typography variant="logo">starklane</Typography>
      <div className="flex space-x-4">
        <ConnectEthereumButton
          isModalOpen={openedModal === "Ethereum"}
          onOpenModalChange={(open: boolean) => {
            open ? openModal("Ethereum") : closeModal();
          }}
        />
        <ConnectStarkNetButton
          isModalOpen={openedModal === "Starknet"}
          onOpenModalChange={(open: boolean) => {
            open ? openModal("Starknet") : closeModal();
          }}
        />
      </div>
    </div>
  );
}
