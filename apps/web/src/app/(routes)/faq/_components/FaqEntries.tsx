import clsx from "clsx";

import FaqEntry from "./FaqEntry";

interface FaqEntriesProps {
  className?: string;
}

export default function FaqEntries({ className }: FaqEntriesProps) {
  return (
    <div className={clsx(className, "flex flex-col gap-6")}>
      <FaqEntry title="What is the ArkProject Bridge?">
        The ArkProject Bridge, developed by Screenshot Labs in partnership with
        Starkware, allows users to bridge NFTs (ERC-721) between Ethereum (L1)
        and Starknet (L2).{" "}
      </FaqEntry>
      <FaqEntry title="What is Starknet?">
        {`Starknet is a permissionless, Validity-Rollup, also known as a
        zero-knowledge rollup (ZK rollup) for Ethereum. It operates as a Layer 2
        (L2) blockchain, enabling any dApp (decentralized application) to
        achieve massive scale for its computation without compromising on
        Ethereum's composability and security. Curious about Starknet? Take a
        deeper dive into it here: `}
        <a
          className="text-space-blue-400 underline"
          href="https://docs.starknet.io/documentation/"
          rel="noreferrer"
          target="_blank"
        >
          https://docs.starknet.io/documentation/
        </a>
        .
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
      <FaqEntry title="How do I use ArkProject to bridge NFTs?">
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
      <FaqEntry title="How do gas fees refunds work?">
        The first 1000 holders who bridge their Everais to Starknet are eligible
        for refunds. Each of these holders can receive a refund of up to $40. At
        the end of the campaign on May 10, the refunds will be made in STRK
        tokens and sent directly to the Starknet wallet you used to bridge your
        Everai.
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
          rel="noreferrer"
          target="_blank"
        >
          support@arkproject.dev
        </a>
        . Our team is committed to providing timely and helpful responses to
        ensure a smooth and enjoyable experience with the ArkProject NFT Bridge.
      </FaqEntry>
      <FaqEntry title="How long does the bridging process take?">
        Transfers typically complete within a few minutes to a few hours,
        depending on network congestion. We strive to ensure that your bridging
        experience is as efficient as possible.
        <b>
          Important note: From Starknet (L2) to (L1), the bridging time can take
          up to 12 hours in certain circumstances due to the recently increased
          size of the blocks!
        </b>
      </FaqEntry>
      <FaqEntry title="Why can't I see my NFT on Starknet (L2)?">
        Some of the wallets (
        <a
          className="text-space-blue-400 underline"
          href="https://www.argent.xyz/"
          rel="noreferrer"
          target="_blank"
        >
          Argent
        </a>
        ,{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://braavos.app/"
          rel="noreferrer"
          target="_blank"
        >
          Braavos
        </a>
        ) and marketplaces (
        <a
          className="text-space-blue-400 underline"
          href="https://unframed.co/"
          rel="noreferrer"
          target="_blank"
        >
          Unframed
        </a>
        ,{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://element.market/starknet"
          rel="noreferrer"
          target="_blank"
        >
          Element
        </a>
        ,{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://hyperflex.market/"
          rel="noreferrer"
          target="_blank"
        >
          HyperFlex
        </a>
        ,{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://pyramid.market/"
          rel="noreferrer"
          target="_blank"
        >
          Pyramid
        </a>
        ,{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://ventory.gg/"
          rel="noreferrer"
          target="_blank"
        >
          Ventory
        </a>
        ) on Starknet may take some time to index your NFT and make it appear
        within their respective products or platforms. So, keep in mind that it
        may take up to several hours for your NFT to appear! Feel free to reach
        out to their respective support channels if you believe there is an
        issue with the display of your item within their ecosystem.
      </FaqEntry>
      <FaqEntry title="Can I bridge my NFT from Starknet (L2) to Ethereum (L1)?">
        The short answer is yes, but it’s a slightly different process. When you
        transfer NFTs from Ethereum (L1) to Starknet (L2), you will need two
        separate transactions: the approval of the collection and the deposit of
        the NFT. If you want to use the bridge from Starknet (L2) back to
        Ethereum (L1), you will also need two transactions: one on Starknet (L2)
        for the deposit and another one on Ethereum (L1) for the withdrawal of
        the NFT.
        <br />
        <br />
        First, you can follow the exact same process as when bridging to
        Starknet (L2), you just need to choose Ethereum (L1) as your
        destination, and it may take up to 12 hours for you to be able to
        withdraw your NFT.
        <br />
        <br />
        Then you will need to connect again with your Ethereum (L1) wallet to
        ArkProject Bridge and issue a withdraw transaction, withdrawing the NFTs
        from the Ethereum (L1) side of the bridge.
        <br />
        <br />
        Until you do this, the NFTs will remain on Starknet (L2) and won’t go
        through to your Ethereum (L1) wallet automatically.
      </FaqEntry>
      <FaqEntry title="How safe are my NFTs in the bridging process?">
        The security of your NFTs is our top priority. The code of the
        ArkProject NFT Bridge went through a thorough auditing process performed
        by{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://cairosecurityclan.com/"
          rel="noreferrer"
          target="_blank"
        >
          Cairo Security Clan
        </a>
        . This ensures early adopters can bridge their NFTs with confidence,
        knowing the system has undergone rigorous scrutiny. The ArkProject NFT
        Bridge uses the{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/messaging-mechanism/"
          rel="noreferrer"
          target="_blank"
        >
          Starknet (L1↔L2) messaging
        </a>{" "}
        {`protocol for ERC-721 bridging smart contracts. The Cairo Security Clan
        development team has reviewed the smart contracts, you'll find the full report in the attachment below for transparency's sake`}{" "}
      </FaqEntry>

      <FaqEntry title="How about other and future collections?">
        Stay tuned for announcements regarding the addition of more
        Ethereum-based and Starknet-based NFT collections to the ArkProject NFT
        Bridge! Collection owners: you will be able to request the whitelisting
        of your collection directly on the ArkProject NFT Bridge{" "}
        <a
          className="text-space-blue-400 underline"
          href="https://bridge.arkproject.dev"
          rel="noreferrer"
          target="_blank"
        >
          website
        </a>
        .{" "}
        {`Just click on the “Submit Collection” section and register your
        collection, we'll be in touch shortly after once your collection is
        ready to be bridged. Please note that only Ethereum-based and
        Starknet-based collections will be supported for bridging (in the
        foreseeable future).`}
      </FaqEntry>
    </div>
  );
}
