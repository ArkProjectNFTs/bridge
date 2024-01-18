import Image from "next/image";
import { useTheme } from "next-themes";

import { CHAIN_LOGOS_BY_NAME } from "~/app/_lib/utils/connectors";
import { type Chain } from "~/app/_types";

interface NftCardImageProps {
  chain?: Chain;
  imageUrl?: string;
}
export default function NftCardImage({ chain, imageUrl }: NftCardImageProps) {
  const { theme } = useTheme();

  return (
    <div className="relative">
      {imageUrl ? (
        <Image
          src={
            imageUrl ??
            `/medias/${theme === "dark" ? "dark/" : ""}empty_nft.png`
          }
          alt="Nft image"
          className="aspect-square h-full w-full rounded-lg object-cover"
          height={300}
          width={300}
        />
      ) : (
        <>
          <Image
            alt="empty Nft image"
            className="hidden aspect-square h-full w-full rounded-lg object-cover dark:block"
            height={300}
            src={`/medias/dark/empty_nft.png`}
            width={300}
          />
          <Image
            alt="empty Nft image"
            className="aspect-square h-full w-full rounded-lg object-cover dark:hidden"
            height={300}
            src={`/medias/empty_nft.png`}
            width={300}
          />
        </>
      )}

      {chain !== undefined && (
        <Image
          alt={`${chain} logo`}
          className="absolute right-2 top-2"
          height={32}
          src={CHAIN_LOGOS_BY_NAME[chain]}
          width={32}
        />
      )}
    </div>
  );
}
