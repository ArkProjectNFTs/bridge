import Image from "next/image";

import { CHAIN_LOGOS_BY_NAME } from "~/app/_lib/utils/connectors";
import { type Chain } from "~/app/_types";
import { type NftMedia } from "~/server/api/types";

import Media from "../Media";

interface NftCardImageProps {
  chain?: Chain;
  media: NftMedia;
}
export default function NftCardImage({ chain, media }: NftCardImageProps) {
  return (
    <div className="relative">
      <Media
        alt=""
        className="aspect-square h-full w-full rounded-lg object-cover"
        height={300}
        media={media}
        width={300}
      />

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
