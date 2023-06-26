import Image from "next/image";

import useCurrentChain from "~/hooks/useCurrentChain";

interface TargetChainButtonProps {
  orientation: "horizontal" | "vertical";
}

export default function TargetChainButton({
  orientation,
}: TargetChainButtonProps) {
  const { toggle } = useCurrentChain();

  return (
    <div className="relative">
      <button
        className={`text-whiterder-[#0e2230] absolute right-1/2 top-1/2 flex h-11 w-11 -translate-y-1/2 
          translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-primary-300
        dark:border-[#0e2230] ${
          orientation === "horizontal" ? "" : "rotate-90"
        } 
        `}
        onClick={toggle}
      >
        <Image
          alt="Change bridge target icon"
          height={26}
          src="/icons/arrows.svg"
          width={26}
        />
      </button>
    </div>
  );
}
