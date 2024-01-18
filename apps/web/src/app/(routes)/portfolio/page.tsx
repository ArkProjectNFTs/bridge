// import { Typography } from "design-system";

import MainPageContainer from "../../_components/MainPageContainer";
import Banner from "./_components/Banner";
import NftsTabs from "./_components/NftsTabs";

export default function Page() {
  return (
    <div className="flex">
      <MainPageContainer>
        <Banner />

        <NftsTabs />

        {/* <Typography
          className="mt-18 text-left"
          component="h2"
          variant="heading_light_s"
        >
          Your past transactions
        </Typography>
        <hr className="mt-5 border-[#e4edec] dark:border-dark-blue-900" />
        <NftTransferList /> */}
      </MainPageContainer>
    </div>
  );
}
