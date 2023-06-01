import { useAccount } from "@starknet-react/core";
import { useState } from "react";
import ConnectStarkNetModal from "./ConnectStarkNetModal";

type ConnectStarkNetButtonProps = {
  kind?: "default" | "error";
  label?: string | null;
};

export default function ConnectStarkNetButton({
  label = "Connect StarkNet Wallet",
}: ConnectStarkNetButtonProps) {
  const { address, status } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const shortAddress = `${address?.slice(0, 6)}••••${address?.slice(-4)}}`;

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function handleClick() {
    openModal();
  }

  return (
    <>
      <button
        className="rounded-xl bg-gray-100 px-3 text-sm"
        onClick={handleClick}
      >
        {status === "disconnected" ? <>{label}</> : <>{shortAddress}</>}
      </button>
      <ConnectStarkNetModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
