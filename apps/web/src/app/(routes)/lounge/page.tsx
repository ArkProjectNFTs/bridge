"use client";

import Footer from "~/app/_components/Footer";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import ChainSwitch from "./_components/ChainSwitch";
// import NftTransferList from "./_components/NftTransferList";
import NftTransferList from "./_components/NftTransferList";

export default function Page() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <ChainSwitch />
          <Banner />
          <NftTransferList className="mt-14" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
