import Footer from "~/app/_components/Footer";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import ChainSwitch from "./_components/ChainSwitch";
import CongratsModal from "./_components/CongratsModal";
import NftTransferList from "./_components/NftTransferList";

interface LoungePageProps {
  searchParams: {
    fromEthereum?: string;
  };
}

export default function LoungePage({ searchParams }: LoungePageProps) {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <CongratsModal
            isFromTransfer={searchParams.fromEthereum !== undefined}
          />
          <ChainSwitch />
          <Banner />
          <NftTransferList className="mt-14" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
