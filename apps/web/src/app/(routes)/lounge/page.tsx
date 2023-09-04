"use client";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import ChainSwitch from "./_components/ChainSwitch";
import NftTransferList from "./_components/NftTransferList";

export default function Page() {
  return (
    <div className="flex">
      <MainPageContainer>
        <ChainSwitch />
        <Banner />
        <NftTransferList />
      </MainPageContainer>
    </div>
  );
}
