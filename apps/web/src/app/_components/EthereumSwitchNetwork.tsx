import { Button, Dialog, Typography } from "design-system";
import { useAccount, useSwitchChain } from "wagmi";

export default function EthereumNetwork() {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  if (chain?.id === chains[0].id || chain === undefined) {
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
        You must switch to Ethereum Mainnet to transfer your Nfts.
      </Typography>
      <div className="w-full px-7">
        <Button
          className="mt-6 w-full"
          onClick={() => switchChain({ chainId: chains[0].id })}
          size="small"
        >
          Switch network
        </Button>
      </div>
    </Dialog>
  );
}
