import { useAccount, useNetwork } from "@starknet-react/core";
import { Dialog, Typography } from "design-system";

export default function StarknetSwitchNetwork() {
  const { chainId: walletChainId } = useAccount();
  const { chain } = useNetwork();

  if (walletChainId === chain.id || walletChainId === undefined) {
    return;
  }

  // We don't want users to be able to close this modal
  return (
    <Dialog isOpen={true} onOpenChange={() => {}} withoutCloseButton>
      <Typography className="mt-6" component="h3" variant="heading_light_xxs">
        Wrong Network
      </Typography>
      <Typography className="mx-7 mt-4" component="p" variant="body_text_14">
        Starklane is not available on this chain.
        <br />
        You must switch to Starknet Mainnet to transfer your Nfts.
      </Typography>
    </Dialog>
  );
}
