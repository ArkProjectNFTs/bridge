import Link from "next/link";

import Footer from "~/app/_components/Footer";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import ChainSwitch from "./_components/ChainSwitch";
import CongratsModal from "./_components/CongratsModal";
// import NftTransferList from "./_components/NftTransferList";
import NftTransferList from "./_components/NftTransferList";

interface LoungePageProps {
  searchParams: {
    fromTransfer?: string;
  };
}

export default function LoungePage({ searchParams }: LoungePageProps) {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <CongratsModal
            isFromTransfer={searchParams.fromTransfer !== undefined}
          />
          <Link href="/lounge/0x1455e5d3c68676b3fc5856e3e9072d19f62c4aaf8af72925713e0a3e8808e103">
            Test Link
          </Link>
          <ChainSwitch />
          <Banner />
          <NftTransferList className="mt-14" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
