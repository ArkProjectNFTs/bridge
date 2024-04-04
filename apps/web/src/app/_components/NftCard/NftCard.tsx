import clsx from "clsx";
import { Typography } from "design-system";

import { type NftMedia } from "~/server/api/types";

import { type Chain } from "../../_types";
import ConditionalWrapper from "../ConditionalWrapper";
import NftCardImage from "./NftCardImage";
import NftCardStackBackground from "./NftCardStackBackground";

type NftCardProps = {
  chain?: Chain;
  className?: string;
  disabled?: boolean;
  isSelected: boolean;
  media: NftMedia;
  onClick?: () => void;
  title: string;
} & (
  | {
      cardType: "collection";
      isBridgeable?: boolean;
      numberOfNfts: number;
    }
  | { cardType: "nft"; numberOfNfts?: never }
);

export default function NftCard({
  cardType,
  chain,
  className,
  disabled,
  isSelected,
  media,
  numberOfNfts,
  onClick,
  title,
}: NftCardProps) {
  return (
    <div
      className={clsx(
        className,
        onClick !== undefined && !disabled && "group",
        disabled && "opacity-40",
        "relative w-full"
      )}
    >
      {cardType === "collection" && (
        <NftCardStackBackground isSelected={isSelected} />
      )}
      {/* TODO @YohanTz: handle focus visible style properly */}
      <ConditionalWrapper
        wrapper={(children) =>
          onClick === undefined || disabled ? (
            <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 dark:border-space-blue-700 dark:bg-space-blue-900">
              {children}
            </div>
          ) : (
            <button
              className={clsx(
                "h-full w-full overflow-hidden rounded-2xl border bg-white p-3 outline outline-1 transition-[outline_border] hover:border-primary-source hover:outline-primary-source focus-visible:border-primary-source focus-visible:outline-primary-source dark:bg-space-blue-900 dark:hover:border-primary-source dark:focus-visible:border-primary-source",
                isSelected
                  ? "border-primary-source outline-primary-source"
                  : "border-neutral-300 outline-transparent dark:border-space-blue-600"
              )}
              onClick={onClick}
            >
              {children}
            </button>
          )
        }
      >
        <NftCardImage chain={chain} media={media} />
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
                className={clsx(
                  "h-5 w-5 flex-shrink-0 rounded-full",
                  isSelected
                    ? "border-[6px] border-primary-source bg-white "
                    : "bg-neutral-300 dark:bg-space-blue-300"
                )}
              />
            )}
          </div>
          {cardType === "collection" ? (
            <Typography
              className="dark:text-space-blue-300"
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
