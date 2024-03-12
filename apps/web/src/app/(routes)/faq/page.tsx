import Footer from "~/app/_components/Footer";
import MainPageContainer from "~/app/_components/MainPageContainer";

import Banner from "./_components/Banner";
import FaqEntries from "./_components/FaqEntries";

export default function FaqPage() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <Banner className="mt-10" />
          <FaqEntries className="my-18" />
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
