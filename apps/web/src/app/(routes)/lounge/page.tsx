import Footer from "~/app/_components/Footer";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import ChainSwitch from "./_components/ChainSwitch";
import CongratsModal from "./_components/CongratsModal";
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
          <ChainSwitch />
          <Banner />
          <NftTransferList className="mt-14" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
