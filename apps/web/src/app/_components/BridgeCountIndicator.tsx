import { BridgeIcon, Typography } from "design-system";
import { usePathname } from "next/navigation";

import useNftSelection from "../(routes)/bridge/_hooks/useNftSelection";
import { useIsSSR } from "../_hooks/useIsSSR";

export default function BrigetCountIndicator() {
  const { totalSelectedNfts } = useNftSelection();

  const isSSR = useIsSSR();

  const pathname = usePathname();

  return (
    <div className="relative flex items-center">
      <BridgeIcon />

      {!isSSR && totalSelectedNfts > 0 && pathname?.includes("/bridge") && (
        <Typography
          className="absolute -right-2 top-0 min-w-[1.5rem] rounded-full border-2 border-white bg-primary-source px-1.5 py-0.5 text-center text-white dark:border-void-black"
          variant="body_text_12"
        >
          {totalSelectedNfts}
        </Typography>
      )}
    </div>
  );
}
