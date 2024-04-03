import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";

interface NftTransferItemLoadingStateProps {
  className?: string;
}

function NftTransferItemLoadingState({
  className,
}: NftTransferItemLoadingStateProps) {
  return (
    <div
      className={clsx(
        className,
        "grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start items-center rounded-2xl border border-asteroid-grey-100 bg-white p-6 dark:border-space-blue-700 dark:bg-space-blue-800"
      )}
    >
      <div className="flex items-center gap-4">
        <Image
          alt="empty Nft image"
          className="hidden aspect-square rounded-lg object-cover dark:block"
          height={62}
          src={`/medias/dark/empty_nft.png`}
          width={62}
        />
        <Image
          alt="empty Nft image"
          className="aspect-square rounded-lg object-cover dark:hidden"
          height={62}
          src={`/medias/empty_nft.png`}
          width={62}
        />
        <div className="flex flex-col gap-3">
          <div className="h-4 w-44 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-600" />
          <div className="h-4 w-16 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-600" />
        </div>
      </div>
    </div>
  );
}

interface NftTransferListLoadingStateProps {
  className?: string;
}

export default function NftTransferListLoadingState({
  className,
}: NftTransferListLoadingStateProps) {
  return (
    <>
      <div
        className={clsx(
          className,
          "mb-5 mt-14 grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start px-6 text-galaxy-blue dark:text-space-blue-300"
        )}
      >
        <Typography component="p" variant="button_text_l">
          Nfts in transit
        </Typography>
        <Typography className="ml-3" component="p" variant="button_text_l">
          Transfer status
        </Typography>
        <Typography className="ml-2" component="p" variant="button_text_l">
          Arrival
        </Typography>
      </div>

      <div className="mb-20 flex flex-col gap-4">
        <NftTransferItemLoadingState />
        <NftTransferItemLoadingState />
        <NftTransferItemLoadingState className="opacity-70" />
        <NftTransferItemLoadingState className="opacity-50" />
        <NftTransferItemLoadingState className="opacity-50" />
      </div>
    </>
  );
}
