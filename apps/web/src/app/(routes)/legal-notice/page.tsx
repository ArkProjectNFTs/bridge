import { Typography } from "design-system";

import Footer from "~/app/_components/Footer";
import MainPageContainer from "~/app/_components/MainPageContainer";

export default function LegalNoticePage() {
  return (
    <>
      <div className="mb-18 flex">
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
              Last updated on March 15, 2024
            </Typography>
          </div>

          <div className="mx-auto max-w-[40rem] text-left">
            <Typography
              className="mb-6"
              component="h2"
              variant="heading_light_s"
            >
              Editor
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`Screenshot Labs, a French simplified joint-stock company with a
              single shareholder corporation established at 7 place de l'Hotel
              de Ville, 93600 Aulnay-sous-bois and registered to the trade and
              companies register of Bobigny under number 898 763 958, with a
              share capital of 100 euros. For any inquiries or questions, you
              can email us at `}
              <a
                className="text-space-blue-400 underline"
                href="mailto:account@arkproject.dev"
              >
                account@arkproject.dev
              </a>
              .
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Hosting provider
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              <ul className="list-disc pl-6">
                <li className="mb-4">Vercel Inc.</li>
                <li className="mb-4">Privately Held Company</li>
                <li className="mb-4">
                  440 N Barranca Ave #4133 Covina, California 91723 United
                  States
                </li>
                <li className="mb-4">Phone number: +1 559 288 7060</li>
                <li className="mb-4">
                  Email address:{" "}
                  <a
                    className="text-space-blue-400 underline"
                    href="mailto:dmca@vercel.com"
                  >
                    dmca@vercel.com
                  </a>
                </li>
              </ul>
            </Typography>
          </div>
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
