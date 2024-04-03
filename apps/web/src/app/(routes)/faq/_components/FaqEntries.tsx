import clsx from "clsx";

import FaqEntry from "./FaqEntry";

interface FaqEntriesProps {
  className?: string;
}

export default function FaqEntries({ className }: FaqEntriesProps) {
  return (
    <div className={clsx(className, "flex flex-col gap-6")}>
      <FaqEntry title="What is the ArkProject Bridge?">
        The ArkProject Bridge, developed by Screenshot Labs, allows users to
        bridge NFTs (ERC-721) between Ethereum (L1) and Starknet (L2).
      </FaqEntry>
      <FaqEntry title="What can I bridge?">
        {`The ArkProject Bridge currently supports the bridging of the Everai NFT
        collection exclusively. Holders of Everai NFTs can seamlessly transfer
        their assets from Ethereum (L1) to Starknet (L2) and vice versa,
        pioneering the integration of NFTs into the next generation of
        blockchain technology. Don't own an Everai yet? `}
        Buy one{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://opensea.io/collection/everai"
          rel="noreferrer"
          target="_blank"
        >
          here
        </a>{" "}
        and join the bridging fun!
      </FaqEntry>
      <FaqEntry title="How do I use ArkProject to bridge NFTs">
        In order to bridge NFTs from Ethereum (L1) to Starknet (L2) via the
        ArkProject Bridge, you will need to set up a Starknet wallet (eg.{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://www.argent.xyz/"
          rel="noreferrer"
          target="_blank"
        >
          Argent
        </a>{" "}
        or{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://braavos.app/"
          rel="noreferrer"
          target="_blank"
        >
          Braavos
        </a>
        {`) to which you will send the NFTs. Then, you will need to
        connect both your Ethereum (L1) wallet and Starknet (L2) wallet to
        ArkProject bridge, and define the NFTs you'd like to send.`}
      </FaqEntry>
      <FaqEntry title="Which way can I bridge?">
        The ArkProject NFT Bridge enables two-way transfers. You can bridge your
        Everai NFTs from Ethereum (L1) to Starknet (L2) and also from Starknet
        (L2) back to Ethereum (L1). This flexibility allows NFT holders to
        leverage the benefits of both L1 and L2 technologies whenever they see
        fit.
      </FaqEntry>
      <FaqEntry title="Do I have to pay for gas fees for bridging?">
        Yes, bridging transactions require the payment of gas fees. When
        transferring NFTs from Ethereum (L1) to Starknet (L2) or vice versa, you
        will be responsible for the gas fees associated with these transactions
        on the respective networks. These fees contribute to the processing and
        security of your transactions on the blockchain.
      </FaqEntry>
      <FaqEntry title="What happens if there is a transfer error?">
        {`In the unlikely event of a transfer error during the bridging process,
        you will have the option to click the "Return To Ethereum (L1)" button.
        This safety feature is designed to ensure that your assets are not lost
        and can be securely retrieved, providing peace of mind during the
        transfer process.`}
      </FaqEntry>
      <FaqEntry title="How can I reach the support team?">
        Should you have any questions or require assistance, our support team is
        ready to help you. You can reach us at{" "}
        <a
          className="text-space-blue-400 underline"
          href="mailto:support@arkproject.dev"
        >
          support@arkproject.dev
        </a>
        . Our team is committed to providing timely and helpful responses to
        ensure a smooth and enjoyable experience with the ArkProject NFT Bridge.
      </FaqEntry>
      <FaqEntry title="Bridging Timeframe">
        Transfers typically complete within a few minutes to a few hours,
        depending on network congestion. We strive to ensure that your bridging
        experience is as efficient as possible.
      </FaqEntry>
      <FaqEntry title="Bridging from Starknet (L2) to Ethereum (L1)">
        When you transfer NFTs from Ethereum to Starknet, it all happens in one
        single transaction. However, if you want to take the bridge from
        Starknet back to Ethereum, you need two separate transactions. Users
        often forget the second step, as it is relevant only once your NFTs are
        actually moved to L1, sometimes hours after you initiated your
        transaction.
        <br />
        <br />
        First, you initiate the transfer on L2 with your Starknet wallet, then
        you need to wait until the block containing the transaction has been
        proved and verified by the Starknet verifier smart contract on Ethereum
        L1. This can take a few hours.
        <br />
        <br />
        Then you will need to connect again with your Ethereum wallet to
        ArkProject Bridge and issue a withdraw transaction, withdrawing the NFTs
        from the Ethereum side of the bridge.
        <br />
        <br />
        {`Until you do this, the NFTs will remain in the L2 side of the bridge and
        won't go through to your L1 wallet.`}
      </FaqEntry>
    </div>
  );
}
