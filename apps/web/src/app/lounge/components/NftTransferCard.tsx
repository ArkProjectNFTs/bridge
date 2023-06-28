import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import NftTransferModal from "./NftTransferModal";

interface NftTransferCard {
  arrivalDate: string;
  image: string;
  name: string;
  status: "error" | "progress" | "transfered";
}

export default function NftTransferCard({
  arrivalDate,
  image,
  name,
  status,
}: NftTransferCard) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 text-left dark:border-dark-blue-600 dark:bg-dark-blue-950"
        onClick={handleOpenModal}
      >
        <Image
          alt="nft image"
          className="h-auto w-full rounded-lg"
          height={200}
          src={image}
          width={200}
        />
        <Typography className="mt-3" component="p" variant="body_text_bold_14">
          {name}
        </Typography>

        <Typography
          className="mt-3 rounded-full bg-red-200 px-2 py-1 text-center"
          component="p"
          variant="body_text_12"
        >
          Error Transfer
        </Typography>

        <Typography
          className="mt-4 text-[#686c73]"
          component="p"
          variant="body_text_12"
        >
          Arrival
        </Typography>
        <Typography variant="button_text_s">{arrivalDate}</Typography>

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
    </>
  );
}
