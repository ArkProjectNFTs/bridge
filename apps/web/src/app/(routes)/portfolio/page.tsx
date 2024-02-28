// import { Typography } from "design-system";

import MainPageContainer from "../../_components/MainPageContainer";
import BridgingQuestBanner from "../bridge/_components/BridgingQuestBanner";
import NftTransferList from "../lounge/_components/NftTransferList";
import Banner from "./_components/Banner";
import NftsTabs from "./_components/NftsTabs";

export default function Page() {
  return (
    <div className="flex">
      <MainPageContainer>
        <Banner />

        <NftsTabs />

        <BridgingQuestBanner className="mt-10" />

        <NftTransferList className="mt-10" showPending={false} />
      </MainPageContainer>
    </div>
  );
}
