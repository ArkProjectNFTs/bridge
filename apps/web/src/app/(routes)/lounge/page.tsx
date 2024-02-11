"use client";

import Link from "next/link";

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
          <Link href="/lounge/0x1b7642adda5f3094d0019c14e79903a9539a89ddeaa39764e2f05339fc06fb01">
            CHECK
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
