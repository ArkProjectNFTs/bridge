import { Modal, Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { CHAIN_LOGOS_BY_NAME } from "../../../_lib/utils/connectors";

interface NftTransferModalProps {
  image?: string;
  isOpen: boolean;
  name: string;
  onOpenChange: (open: boolean) => void;
}

export default function NftTransferModal({
  image,
  isOpen,
  name,
  onOpenChange,
}: NftTransferModalProps) {
  const { sourceChain, targetChain } = useCurrentChain();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="mt-5 flex w-full flex-col gap-5">
        <div className="flex w-full gap-4">
          <div>
            {image ? (
              <Image
                alt="nft image"
                className="h-28 w-28 rounded-lg"
                height={112}
                src={image}
                width={112}
              />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-dark-blue-100 object-cover text-center dark:bg-dark-blue-800">
                <Typography variant="body_text_16">No metadata</Typography>
              </div>
            )}
          </div>
          <div className="w-full">
            <Typography component="h3" ellipsable variant="heading_light_xs">
              {name}
              <br />
              Migration in Progress
            </Typography>
            <Typography variant="body_text_14">
              Your asset cross the bridge, the small walk will take 15 minutes
            </Typography>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-[#F7FBFA] px-4 py-3 dark:bg-dark-blue-900">
          {/* <div className="flex items-center justify-between rounded-md bg-[#F7FBFA] px-4 py-3 dark:bg-galaxy-blue"> */}
          <Image
            alt={`${CHAIN_LOGOS_BY_NAME[sourceChain]} logo`}
            height={52}
            src={CHAIN_LOGOS_BY_NAME[sourceChain]}
            width={52}
          />

          <Typography
            className="text-center"
            component="p"
            variant="button_text_s"
          >
            🌈 <br />
            Assets en route to {targetChain}
          </Typography>

          <Image
            alt={`${CHAIN_LOGOS_BY_NAME[targetChain]} logo`}
            height={52}
            src={CHAIN_LOGOS_BY_NAME[targetChain]}
            width={52}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Typography variant="body_text_14">Transaction sent</Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body_text_14">
              Transaction confirmed
            </Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
          <div className="flex justify-between">
            <Typography variant="body_text_14">
              Nfts received on {targetChain}
            </Typography>
            <Typography variant="body_text_14">1/1</Typography>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-[#F0E9FFE0] p-3">
          <Typography component="p" variant="body_text_14">
            Note that it will not cancel the gas fee.
          </Typography>
          {/* <Button variant="s">Stop transfer</Button> */}
        </div>
      </div>
    </Modal>
  );
}
