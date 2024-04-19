import { Typography } from "design-system";

import Footer from "~/app/_components/Footer";
import MainPageContainer from "~/app/_components/MainPageContainer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <div className="relative mx-auto max-w-[37.5rem] pb-20 pt-13 text-center">
            <Typography component="h1" variant="heading_light_l">
              Privacy policy
            </Typography>
            <Typography
              className="mt-4 text-space-blue-source dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              Last updated on April 19, 2024
            </Typography>
          </div>

          <div className="mx-auto mb-18 max-w-[40rem] text-left">
            <Typography
              className="mb-6"
              component="h2"
              variant="heading_light_s"
            >
              Introduction
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`Welcome to the ArkProject Bridge and ArkQuests privacy policy.
              This Privacy Policy explains how personal data relating to you is
              collected and used by Screenshot Labs (“Screenshot Labs,” “we,”
              “our,” “ours,” and “us”), a French corporation established at 7
              place de l'Hotel de Ville, 93600 Aulnay-sous-bois, FRANCE.`}
              <br />
              <br />
              {`The ArkProject Bridge (the "Bridge"), located at `}
              <a
                className="text-space-blue-400 underline"
                href="https://bridge.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                https://bridge.arkproject.dev/
              </a>
              {`, allows users to connect their
              digital wallets for the purpose of transferring NFTs between the
              Ethereum Blockchain and the Starknet Blockchain.`}
              <br />
              <br />
              The ArkQuests located at{" "}
              <a
                className="text-space-blue-400 underline"
                href="http://quests.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                http://quests.arkproject.dev/
              </a>
              , allows users to validate quests to gather points and get
              rewards.
              <br />
              <br />
              This Privacy Policy applies to personal data we collect when you
              use the Bridge and/or ArkQuests located at{" "}
              <a
                className="text-space-blue-400"
                href="https://bridge.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                https://bridge.arkproject.dev/
              </a>{" "}
              or{" "}
              <a
                className="text-space-blue-400"
                href="http://quests.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                http://quests.arkproject.dev/
              </a>{" "}
              or otherwise interact with the services or tools we provide
              (together the “ArkProject Services”). We are committed to
              protecting and respecting your privacy.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Personal Data We Collect
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              When using the ArkProject Services, we collect the following types
              of data relating to you:
              <ul className="mt-3 list-disc pl-6">
                <li className="mb-4">
                  <b>Crypto Wallet Addresses</b>: You will need to connect your
                  Ethereum and Starknet wallets in order to (i) allow the
                  transfer of NFTs through the Bridge, or (ii) validate quests
                  relating to the Bridge or validate any other relevant quests.
                  We will therefore process your digital wallets addresses for
                  executing transactions and providing you the ArkProject
                  Services.
                </li>
                <li className="mb-4">
                  <b>NFT Collections Data</b>: We also collect information about
                  the NFT collections in your Ethereum and Starknet wallets,
                  including but not limited to, transaction history, ownership
                  details, and metadata. This data allows us to provide relevant
                  services and improve user experience on the ArkProject
                  Services.
                </li>
                <li className="mb-4">
                  <b>X (Twitter) Account Access Information</b>: If you opt to
                  connect your X (Twitter) account with the Bridge, or to
                  participate to ArkQuests, we will collect your Twitter
                  username and public profile information. This information is
                  used to provide the relevant ArkProject Services.
                </li>
                <li className="mb-4">
                  <b>Marketplace Interaction Data</b>: After using the
                  ArkProject Bridge, you may access various NFT marketplaces
                  (e.g. Element, Pyramid, Unframed, Flex, Ventory, OpenSea, etc)
                  directly from the ArkProject Services. We will track your
                  interactions with such marketplaces (until you leave the
                  ArkProject Services), including tracking clicks and user
                  navigation patterns on the ArkProject Services, to understand
                  user preferences and improve service offerings.
                </li>
                <li>
                  <b>
                    Information Collected by Cookies and Other Tracking
                    Technologies when you use the ArkProject Services
                  </b>
                  : We may use various technologies to collect information,
                  including cookies and web beacons. Cookies are small data
                  files stored on your hard drive or in device memory that help
                  us improve our services and your experience, see which areas
                  and features of our services are popular and count visits. Web
                  beacons are electronic images that may be used in our services
                  or emails and help deliver cookies, count visits and
                  understand usage and campaign effectiveness. For more
                  information which cookies are used and how to disable them,
                  please see sections “Data Recipients and processors” and “Your
                  Rights” below. When you access or use the ArkProject Services,
                  we may automatically collect information about you, including:
                  <ul className="mt-3 list-disc pl-6">
                    <li className="mb-2">
                      <b>Log Information</b>: We may collect log information
                      about your use of the ArkProject Services, including the
                      type of browser you use, access times, pages viewed, your
                      IP address and the page you visited before navigating to
                      the ArkProject Services.
                    </li>
                    <li>
                      <b>Device Information</b>: We may collect information
                      about the computer or mobile device you use to access the
                      ArkProject Services, including the hardware model,
                      operating system and version, unique device identifiers
                      and mobile network information.
                    </li>
                  </ul>
                </li>
              </ul>
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              How We Use Your Personal Data
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              The data collected via the ArkProject Services is used to:
              <ul className="mt-3 list-disc pl-6">
                <li className="mb-4">
                  Facilitate the transfer and management of NFTs between
                  blockchains.
                </li>
                <li className="mb-4">
                  Personalize and enhance your experience on the ArkProject
                  Services.
                </li>
                <li className="mb-4">
                  Analyze and improve our service offerings and user interface.
                </li>
                <li className="mb-4">
                  To provide, maintain, and improve our services;
                </li>
                <li className="mb-4">
                  Monitor and analyze trends, usage and activities in connection
                  with our services;
                </li>
                <li className="mb-4">
                  Detect, investigate and prevent fraudulent transactions and
                  other illegal activities and protect the rights and property
                  of Screenshot Labs and others; and
                </li>
                <li className="mb-4">
                  Carry out any other purpose described to you at the time the
                  information was collected.
                </li>
              </ul>
              These uses are either based on the performance of our agreement
              with you to provide you with the relevant services or on our
              legitimate interest to process your personal data for the above
              purposes.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Data Sharing, data recipients and processors
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              We may share the personal data relating to you and collected
              through the ArkProject Services with:
              <ul className="mt-3 list-disc pl-6">
                <li className="mb-4">
                  Partnered NFT marketplaces, to enhance interoperability and
                  user experience across platforms. Any data sharing will be
                  conducted in accordance with this Privacy Policy and with the
                  aim of providing seamless service integration.
                </li>
                <li className="mb-4">
                  Service providers and third-party vendors who assist us in
                  providing the ArkProject Services, subject to strict data
                  protection and privacy conditions.
                </li>
                <li className="mb-4">
                  We may also use or share personal data about you as follows or
                  as otherwise described in this Privacy Policy:
                  <ul className="mt-3 list-disc pl-6">
                    <li className="mb-2">
                      With consultants and other service providers who need
                      access to such information to carry out work on our
                      behalf;
                    </li>
                    <li className="mb-2">
                      In response to a request for information if we believe
                      disclosure is in accordance with, or required by, any
                      applicable law, regulation or legal process;
                    </li>
                    <li className="mb-2">
                      In connection with, or during negotiations of, any merger,
                      sale of company assets, financing or acquisition of all or
                      a portion of our business by another company;
                    </li>
                    <li className="mb-2">
                      Between and among Screenshot Labs and our current and
                      future parents, affiliates, subsidiaries and other
                      companies under common control and ownership; and
                    </li>
                    <li>With your consent or at your direction.</li>
                  </ul>
                </li>
              </ul>
              Our website uses cookies. Some cookies which are used for the sole
              purpose of enabling or facilitating use of the website or which
              are strictly necessary for the provision of an online
              communication service at the express request of the user (such as
              cookies intended for authentication to a service or to store the
              contents of a shopping cart), are deemed “essential” and cannot be
              refused. You can however accept or refuse non-essential cookies or
              tracking technologies which are implemented by the following third
              parties that act as our processors:
              <ul className="mt-3 list-disc pl-6">
                <li className="mb-4">
                  <b>Mixpanel</b>: Our website utilizes{" "}
                  <a
                    className="text-space-blue-400 underline"
                    href="https://mixpanel.com/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Mixpanel
                  </a>
                  , a web analytics service provided by Mixpanel Inc. Mixpanel
                  uses cookies and other tracking technologies to help us
                  understand how users engage with our website by reporting on
                  their interactions and usage patterns. Mixpanel collects data
                  about your use of our site, such as:
                  <ul className="mt-3 list-disc pl-6">
                    <li className="mb-2">
                      How you interact with our website, including the pages you
                      visit and the links you click on.
                    </li>
                    <li className="mb-2">
                      Information about the device and browser you use to access
                      our site, including type, settings, and unique
                      identifiers.
                    </li>
                    <li>
                      Actions you take within our application, including the
                      features you use and the time spent on our application.
                    </li>
                  </ul>
                </li>
                <li className="mb-4">
                  <b>Hotjar</b>: Our website uses{" "}
                  <a
                    className="text-space-blue-400 underline"
                    href="https://www.hotjar.com/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Hotjar
                  </a>
                  {`, an analysis and
                  feedback tool provided by Hotjar Ltd, which helps us to
                  understand how our website's users use it (e.g., how much time
                  they spend on which pages, which links they choose to click,
                  what users do and don't like, etc.) and this enables us to
                  build and maintain our service with user feedback. Hotjar uses
                  cookies and other technologies to collect data on our users'
                  behavior and their devices. This includes:`}
                  <ul className="mt-3 list-disc pl-6">
                    <li className="mb-2">
                      Device-specific data, such as device type, screen size,
                      country of access, and browser information.
                    </li>
                    <li className="mb-2">
                      Log data such as referring domain, pages visited,
                      geographic location, preferred language used to display
                      our website, and the date and time of access.
                    </li>
                    <li>
                      User interactions like mouse events (movements, location,
                      and clicks) and keypresses.
                    </li>
                  </ul>
                </li>
              </ul>
              We do not sell or share your personal information with third
              parties for their marketing purposes without your explicit
              consent.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Data Security
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              We are committed to protecting your personal information and have
              implemented appropriate security measures to protect your
              information from unauthorized access, use, or disclosure.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              International transfers
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`You are informed that your personal information may be hosted in
              the US by our processors. Transfers of personal data from the
              European Union to the US are covered by the Data Privacy Framework
              and the European Commission's adequacy decision or by the Standard
              Contractual Clauses. For more information regarding the transfers
              of personal information, you can email us at: `}
              <a
                className="text-space-blue-400 underline"
                href="mailto:account@arkproject.dev"
              >
                account@arkproject.dev.
              </a>
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Your Rights and Choices
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              Under the terms of the regulations, you may exercise the rights
              detailed below at any time:
              <br />
              1. <b>Right of access</b>: you may obtain information on the
              nature, origin and use of your personal data. If your personal
              data is transmitted to third parties, you may also obtain
              information concerning the identity or categories of recipients;
              <br />
              <br />
              2. <b>Right of rectification</b>: you may request that inaccurate
              or incomplete personal data be rectified or completed;
              <br />
              <br />
              3. <b>Right to erasure</b>: you may request the erasure of your
              personal data, in particular if the personal data is no longer
              required for the purposes of processing, except in the cases
              provided for by the regulations;
              <br />
              <br />
              4. <b>Right to limit processing</b>: you may request that your
              personal data be made temporarily inaccessible in order to limit
              their future processing in the situations provided for by the
              applicable regulations;
              <br />
              <br />
              5. <b>Right to object</b>: you may object to certain processing of
              your personal data on grounds relating to your particular
              situation unless there are compelling legitimate grounds for the
              processing which override your interests, rights and freedoms or
              for the establishment, exercise or defense of legal claims. You
              may also object to the processing of your personal data at any
              time and without giving any reason for commercial prospecting
              purposes.
              <br />
              <br />
              6. <b>Right to portability</b>: in applicable cases, you may
              request to receive communication of the personal data that you
              have provided to us, in a structured and commonly used computer
              format.
              <br />
              <br />
              7. Right to communicate instructions regarding the fate of your
              personal data in the event of your death.
              <br />
              <br />
              You may exercise these rights by writing by email to:{" "}
              <a
                className="text-space-blue-400 underline"
                href="mailto:account@arkproject.dev"
              >
                account@arkproject.dev
              </a>
              . You may also make a complaint to your supervisory authority in
              the event that you consider that the processing of personal data
              does not comply with the applicable regulations.
              <br />
              <br />
              <b>Cookies</b>. Most web browsers are set to accept cookies by
              default. If you prefer, you can usually choose to set your browser
              to remove or reject browser cookies. Removing or rejecting browser
              cookies does not necessarily affect third party cookies used in
              connection with the ArkProject Services. Please note that if you
              choose to remove or reject cookies, this could affect the
              availability and functionality of the ArkProject Services.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Retention
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              We will only store your personal information as long as necessary
              for the purposes specified above.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Changes to this Privacy Policy
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`We may update this privacy policy from time to time. The updated
              policy will be posted on this page with a new "Last Updated" date.`}
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Contact Us
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              If you have any questions about this privacy policy, please
              contact us at{" "}
              <a
                className="text-space-blue-400 underline"
                href="mailto:account@arkproject.dev"
              >
                account@arkproject.dev
              </a>
              .
            </Typography>
          </div>
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
