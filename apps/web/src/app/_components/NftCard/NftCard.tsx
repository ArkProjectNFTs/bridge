import { Typography } from "design-system";

import { type Chain } from "../../_types";
import ConditionalWrapper from "../ConditionalWrapper";
import NftCardImage from "./NftCardImage";
import NftCardStackBackground from "./NftCardStackBackground";

type NftCardProps = {
  chain?: Chain;
  image?: string;
  isSelected: boolean;
  onClick?: () => void;
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
  chain,
  image,
  isSelected,
  numberOfNfts,
  onClick,
  title,
}: NftCardProps) {
  return (
    <div className={`${onClick !== undefined ? "group" : ""} relative w-full`}>
      {cardType === "collection" && (
        <NftCardStackBackground isSelected={isSelected} />
      )}
      {/* TODO @YohanTz: handle focus visible style properly */}
      <ConditionalWrapper
        wrapper={(children) =>
          onClick === undefined ? (
            <div
              className={`h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 dark:border-dark-blue-600 dark:bg-dark-blue-950`}
            >
              {children}
            </div>
          ) : (
            <button
              className={`h-full w-full overflow-hidden rounded-2xl border bg-white p-3 outline outline-1 transition-[outline_border] dark:bg-dark-blue-950 ${
                isSelected
                  ? "border-primary-source outline-primary-source"
                  : "border-neutral-300 outline-transparent dark:border-dark-blue-600"
              }
              hover:border-primary-source hover:outline-primary-source
              dark:hover:border-primary-source dark:hover:outline-primary-source`}
              onClick={onClick}
            >
              {children}
            </button>
          )
        }
      >
        <NftCardImage chain={chain} imageUrl={image} />
        <div className="mt-3 text-left">
          <div className="flex items-center justify-between">
            <Typography
              variant={
                cardType === "nft" ? "body_text_bold_14" : "body_text_bold_16"
              }
              ellipsable
            >
              {title}
            </Typography>
            {cardType === "nft" && onClick !== undefined && (
              <div
                className={`h-5 w-5 rounded-full ${
                  isSelected
                    ? "border-[6px] border-primary-source bg-white "
                    : "bg-neutral-300 dark:bg-dark-blue-300"
                }`}
              />
            )}
          </div>
          {cardType === "collection" ? (
            <Typography
              className="dark:text-dark-blue-300"
              variant="body_text_14"
            >
              {numberOfNfts}
              {numberOfNfts > 1 ? " Nfts" : " Nft"}
            </Typography>
          ) : null}
        </div>
      </ConditionalWrapper>
    </div>
  );
}
