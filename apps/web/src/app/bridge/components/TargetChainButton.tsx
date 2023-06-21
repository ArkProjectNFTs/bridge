import { useLocalStorage } from "usehooks-ts";
import { type Chain } from "../helpers";
import Image from "next/image";

interface TargetChainButtonProps {
  orientation: "horizontal" | "vertical";
}

export default function TargetChainButton({
  orientation,
}: TargetChainButtonProps) {
  const [targetChain, setTargetChain] = useLocalStorage<Chain>(
    "chain",
    "Ethereum"
  );

  function toggle() {
    setTargetChain(targetChain === "Ethereum" ? "Starknet" : "Ethereum");
  }

  return (
    <div className="relative">
      <button
        className={`absolute right-1/2 top-1/2 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-300 text-white ${
          orientation === "horizontal" ? "" : "rotate-90"
        }`}
        onClick={toggle}
      >
        <Image
          src="/icons/arrows.svg"
          height={26}
          width={26}
          alt="Change bridge target icon"
        />
      </button>
    </div>
  );
}
