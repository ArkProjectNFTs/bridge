import TokenList from "./TokenList";

export default function Page({ params }: { params: { address: string } }) {
  return <TokenList nftContractAddress={params.address} />;
}
