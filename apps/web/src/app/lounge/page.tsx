"use client";

import MainPageContainer from "../components/MainPageContainer";
import Banner from "./components/Banner";
import ChainSwitch from "./components/ChainSwitch";
import NftTransferList from "./components/NftTransferList";

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
