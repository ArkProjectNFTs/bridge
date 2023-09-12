import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import NftCardStackBackground from "~/app/_components/NftCard/NftCardStackBackground";
import { type BridgeRequestEventStatus } from "~/server/api/routers/bridgeRequest";

import NftCardStatus from "./NftCardStatus";
import NftTransferModal from "./NftTransferModal";

interface NftTransferCard {
  image?: string;
  name: string;
  status: BridgeRequestEventStatus;
  statusTimestamp: number;
}

export default function NftTransferCard({
  image,
  name,
  status,
  statusTimestamp,
}: NftTransferCard) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  return (
    <div className="relative w-full">
      <NftCardStackBackground />
      <button
        className="h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 text-left dark:border-dark-blue-600 dark:bg-dark-blue-950"
        onClick={handleOpenModal}
      >
        {image ? (
          <Image
            alt="nft image"
            className="aspect-[11/9] h-auto w-full rounded-lg object-cover"
            height={200}
            src={image}
            width={200}
          />
        ) : (
          <div className="flex aspect-[11/9] h-auto w-full items-center justify-center rounded-lg bg-dark-blue-100 object-cover dark:bg-dark-blue-800">
            <Typography variant="body_text_16">No metadata</Typography>
          </div>
        )}
        <Typography
          className="mt-3"
          component="p"
          ellipsable
          variant="body_text_bold_14"
        >
          {name}
        </Typography>
        <NftCardStatus status={status} />

        <Typography
          className="mt-4 text-[#686c73]"
          component="p"
          variant="body_text_12"
        >
          Arrival
        </Typography>
        <Typography variant="button_text_s">{statusTimestamp}</Typography>

        <Typography
          className="mt-2 underline"
          component="p"
          variant="button_text_s"
        >
          View more
        </Typography>
      </button>
      <NftTransferModal
        image={image}
        isOpen={isModalOpen}
        name={name}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
