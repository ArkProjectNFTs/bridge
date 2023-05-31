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
          <div className="absolute inset-0 z-[-1] translate-y-2 rounded-lg border border-neutral-200 bg-neutral-100" />
          <div className="absolute inset-0 z-[-2] translate-y-4 rounded-lg border border-neutral-200 bg-neutral-100" />
        </>
      )}
      {/* TODO @YohanTz: handle focus visible style properly */}
      <button
        className={`h-full w-full overflow-hidden rounded-lg border border-neutral-300 bg-white text-black ${
          isSelected ? "border-emerald-400" : "border-neutral-300"
        }`}
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
            <span className="font-semibold">{title}</span>
            <div
              className={`h-5 w-5 rounded-full ${
                isSelected
                  ? "border-[6px] border-emerald-400 bg-white "
                  : "bg-neutral-300"
              }`}
            ></div>
          </div>
          {cardType === "collection" ? (
            <span className="text-emerald-400">
              {numberOfNfts}
              {numberOfNfts > 1 ? " Nfts" : " Nft"}
            </span>
          ) : null}
        </div>
      </button>
    </div>
  );
}
