"use client";

import Image from "next/image";

type NftCardProps = {
  image?: string;
  title: string;
} & (
  | {
      cardType: "collection";
      numberOfNfts: number;
    }
  | { cardType: "nft"; numberOfNfts?: never }
);

export default function NftCard({
  cardType,
  image,
  numberOfNfts,
  title,
}: NftCardProps) {
  return (
    <button className="overflow-hidden rounded-lg border border-gray-300 bg-white text-black">
      {/* TODO @YohanTz: Handle images with different sizes */}
      <Image
        // TODO @YohanTz: Handle no image case
        src={image || ""}
        alt={title}
        width={300}
        height={300}
        className="w-full"
      />
      <div className="m-2 text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium">{title}</span>
          <div className="h-5 w-5 rounded-full bg-gray-300"></div>
        </div>
        {cardType === "collection" ? (
          <span className="text-violet-500">
            {numberOfNfts}
            {numberOfNfts > 1 ? "Nfts" : "Nft"}
          </span>
        ) : null}
      </div>
    </button>
  );
}
