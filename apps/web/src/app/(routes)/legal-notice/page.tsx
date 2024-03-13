import { Typography } from "design-system";

import Footer from "~/app/_components/Footer";
import MainPageContainer from "~/app/_components/MainPageContainer";

export default function LegalNoticePage() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <div className="relative mx-auto max-w-[37.5rem] pb-20 pt-13 text-center">
            <Typography component="h1" variant="heading_light_l">
              Legal notice
            </Typography>
            <Typography
              className="mt-4 text-space-blue-source dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              Last updated on March 12, 2024
            </Typography>
          </div>

          <div className="mx-auto max-w-[40rem] text-left"></div>
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
