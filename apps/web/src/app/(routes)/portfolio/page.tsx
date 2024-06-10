import Footer from "~/app/_components/Footer";

import MainPageContainer from "../../_components/MainPageContainer";
import NftTransferList from "../lounge/_components/NftTransferList";
import Banner from "./_components/Banner";
import NftsTabs from "./_components/NftsTabs";

export default function Page() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <Banner />

          <NftsTabs />

          <NftTransferList variant="lounge" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
