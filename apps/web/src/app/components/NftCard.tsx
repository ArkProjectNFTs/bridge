import { Typography } from "design-system";
import Image from "next/image";

type NftCardProps = {
  image?: string;
  isSelected: boolean;
  onClick: () => void;
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
  isSelected,
  numberOfNfts,
  onClick,
  title,
}: NftCardProps) {
  return (
    <div className="relative w-full">
      {cardType === "collection" && (
        <>
          <div className="absolute inset-0 z-[-1] -translate-x-1 translate-y-1 rounded-2xl border border-neutral-200 bg-white" />
          <div className="absolute inset-0 z-[-2] -translate-x-2 translate-y-2 rounded-2xl border border-neutral-200 bg-white" />
        </>
      )}
      {/* TODO @YohanTz: handle focus visible style properly */}
      <button
        className={`h-full w-full overflow-hidden rounded-2xl border bg-white p-3 ${
          isSelected && cardType === "nft"
            ? "border-primary-300 outline outline-1 outline-primary-300"
            : "border-neutral-300"
        } ${isSelected && cardType === "nft" ? "" : ""}`}
        onClick={onClick}
      >
        {/* TODO @YohanTz: Handle images with different sizes */}
        <Image
          // TODO @YohanTz: Handle no image case
          src={image ?? ""}
          alt={title}
          width={300}
          height={300}
          className="w-full rounded-lg"
        />
        <div className="mt-3 text-left">
          <div className="flex items-center justify-between">
            <Typography
              variant={
                cardType === "nft" ? "body_text_bold_14" : "body_text_bold_16"
              }
            >
              {title}
            </Typography>
            {cardType === "nft" && (
              <div
                className={`h-5 w-5 rounded-full ${
                  isSelected
                    ? "border-[6px] border-primary-300 bg-white "
                    : "bg-neutral-300"
                }`}
              />
            )}
          </div>
          {cardType === "collection" ? (
            <Typography variant="body_text_14">
              {numberOfNfts}
              {numberOfNfts > 1 ? " Nfts" : " Nft"}
            </Typography>
          ) : null}
        </div>
      </button>
    </div>
  );
}
