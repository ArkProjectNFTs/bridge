import { Typography } from "design-system";
import Link from "next/link";

import Footer from "~/app/_components/Footer";
import MainPageContainer from "~/app/_components/MainPageContainer";

export default function TermsOfUsePage() {
  return (
    <>
      <div className="flex">
        <MainPageContainer>
          <div className="relative mx-auto max-w-[37.5rem] pb-20 pt-13 text-center">
            <Typography component="h1" variant="heading_light_l">
              Terms of use
            </Typography>
            <Typography
              className="mt-4 text-space-blue-source"
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
              Introduction to ArkProject Bridge
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
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
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Introduction to ArkQuests
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`The ArkQuests, located at `}
              <a
                className="text-space-blue-400 underline"
                href="http://quests.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                http://quests.arkproject.dev/
              </a>
              {`allows users to validate quests to gather points and get rewards (to be determined and announced at a later stage). `}
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Scope and acceptance of the Terms
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              These Terms of Use (the “Terms,”) govern your relationship with
              Screenshot Labs (or “us”, “we”) for the use of the Bridge and/or
              ArkQuests located at{" "}
              <a
                className="text-space-blue-400 underline"
                href="https://www.bridge.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                https://www.bridge.arkproject.dev/
              </a>{" "}
              or how you otherwise interact with the services or tools we
              provide (together the “ArkProject Services”).
              <br />
              <br />
              Please read these Terms and our Privacy Policy located at{" "}
              <a
                className="text-space-blue-400 underline"
                href="https://www.bridge.arkproject.dev/"
                rel="noreferrer"
                target="_blank"
              >
                https://bridge.arkproject.dev/privacy
              </a>{" "}
              carefully.
              <br />
              <br />
              You warrant that you are of legal age to enter into these Terms
              and are legally permitted to use services that involve digital
              asset transactions in your jurisdiction.
              <br />
              <br />
              By using the ArkProject Services, you agree to be bound by these
              Terms. If you disagree with any part of these Terms, you must not
              use the ArkProject Services.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Amendment to the Terms
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              You are advised to check these Terms periodically as they may be
              updated. Changes will take effect immediately from posting of the
              revised Terms our websites.
              <br />
              <br />
              You agree that continued use of the ArkProject Services shall
              constitute acceptance of such amendments.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Conditions to use the ArkProject Services
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              To use the ArkProject Services, you must connect a digital wallet
              supported. You are responsible for maintaining the security of
              your wallet and any transactions made through it.
              <br />
              <br />
              You agree to comply with all applicable laws and regulations in
              your use of the ArkProject Services.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Changes to the ArkProject Services
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              We reserve the right to modify, suspend, or discontinue the
              ArkProject Services at any time without notice or liability.
              <br />
              <br />
              If the Bridge is suspended or discontinued, you acknowledge that
              you no longer will be able to transfer your NFTs between Ethereum
              (L1) and Starknet (L2) by using the Bridge. You will have to find
              alternative solutions to transfer your NFTs otherwise they will
              remain on the blockchain where they were located at the moment of
              suspension and discontinuance.
              <br />
              <br />
              If ArkQuests is suspended or discontinued, you acknowledge that
              you may no longer be able to validate Ark quests and that you will
              lose your points and rewards.
              <br />
              <br />
              We will do our best effort to make a general announcement and give
              prior notice of suspension or discontinuance.
              <br />
              <br />
              Access to the ArkProject Services is provided on a “as is” and “as
              available” basis only. We do not guarantee that the ArkProject
              Services, or any content on our websites will always be available
              or uninterrupted.
              <br />
              <br />
              From time to time, access may be interrupted, suspended or
              restricted, including because of a fault, error or unforeseen
              circumstances or because we are carrying out planned maintenance.
              <br />
              <br />
              We may also suspend or disable your access to the ArkProject
              Services if we consider it reasonable to do so, e.g. you breach
              these Terms.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Acknowledgment on consequences and risks of the use of the Bridge
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              Transactions facilitated by the Bridge are irreversible and
              recorded on the respective blockchains. You acknowledge the public
              nature of blockchain transactions and the associated risks.
              <br />
              <br />
              You understand the inherent risks associated with using blockchain
              technology and digital assets, including but not limited to,
              volatility risks, regulatory uncertainty, and technological risks.
              You acknowledge that the use of the Bridge is entirely at your own
              risk.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Free Service
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              The ArkProject Services are provided to you by Screenshot Labs as
              free services.
              <br />
              <br />
              You are however responsible for all network fees and any other
              costs associated with using the Bridge or making transactions on
              the blockchain.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Ark Quests
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              To participate to ArkQuests, you will need to connect (i) the same
              digital wallets as the ones you used to bridge your NFTs and (ii)
              your X (ex. Twitter) account.
              <br />
              <br />
              For more information, please refer to our{" "}
              <Link className="text-space-blue-400 underline" href="/faq">
                FAQ
              </Link>
              .
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Prohibited behaviour
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              You agree to access and use the ArkProject Services only for its
              intended purpose and will not attempt to:
              <br />
              <br />
              1. Hack, make unauthorized alterations to, gain unauthorized
              access to, or introduce any kind of malicious code to the
              ArkProject Services by any means;
              <br />
              <br />
              2. Use the ArkProject Services for any purpose that is unlawful;
              <br />
              <br />
              3. Use the ArkProject Services in any manner that disrupts its
              operation;
              <br />
              <br />
              4. Disguise or interfere in any way with the IP address of the
              computer you are using to access the ArkProject Services or
              otherwise take steps to prevent us from correctly identifying the
              actual IP address of the computer you are using whilst using the
              ArkProject Services.
              <br />
              <br />
              You acknowledge that your use of the Bridge contains certain
              risks, including without limitation the risks that the ArkProject
              Services may be suspended or terminated for any or no reason.
              Accordingly, you expressly agree that you assume all risk in
              connection with your access and use of the ArkProject Services.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Third party links
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              {`The ArkProject Services may contain hyperlinks or references to
              third party websites. Any such hyperlinks or references are
              provided for your information and convenience only. We have no
              control over third party websites and accept no legal
              responsibility for any content, material or information contained
              in them. The display of any hyperlink and reference to any
              third-party website does not mean that we endorse that third
              party's website, products or services. Your use of a third-party
              site may be governed by the terms and conditions of that
              third-party site.`}
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Privacy Policy
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              The ArkProject Services may collect personal data relating to you.
              You can find more information about how we will process your
              personal data in our{" "}
              <Link className="text-space-blue-400 underline" href="/privacy">
                Privacy Policy
              </Link>
              .
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Intellectual Property
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              We are the owner of all intellectual property rights in the
              ArkProject Services. These works are protected by copyright laws
              and all such rights are reserved. We grant you a worldwide,
              non-exclusive, royalty-free, revocable license to use the
              ArkProject Services for non commercial purposes.
              <br />
              <br />
              Use of the ArkProject Services does not grant you any ownership in
              the software or intellectual property of the ArkProject Services,
              except for the limited rights to use the ArkProject Services as
              specified in these Terms.
              <br />
              <br />
              You agree not to copy our web pages or any content without our
              prior consent. Any unauthorized use or reproduction may be
              prosecuted.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Disclaimers
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              <b>
                You agree that your use of the ArkProject Services will be at
                your sole risk. To the fullest extent permitted by law, we
                disclaim all warranties, express or implied, in connection with
                the ArkProject Services and your use thereof.
              </b>
              <br />
              <br />
              The Bridge, Ethereum, Starknet and other blockchain networks are
              decentralized systems that are still under active development, and
              therefore:
              <br />
              <br />
              (a) may contain bugs, errors and defects,
              <br />
              (b) may function improperly or be subject to periods of downtime
              and unavailability,
              <br />
              (c) may result in total or partial loss or corruption of NFTs and
              cryptocurrencies with respect to which they are used and/or data,
              <br />
              (d) may be modified at any time, including through the release of
              subsequent versions, all with or without notice to you, or
              <br />
              (e) may have security vulnerabilities and be subject to hacking.
              <br />
              <br />
              Screenshot Labs will not be liable or responsible for any losses
              or damages to you, including without limitation any loss of NFTs
              on Ethereum and/or Starknet with which you conduct your
              transactions using the Bridge, as a result of any of the
              foregoing.
              <br />
              <br />
              {`The ArkProject Services are provided on an "as is" and "as
              available" basis, as free services and therefore without any
              warranty. We do not guarantee uninterrupted or error-free
              operation of the ArkProject Services nor that the ArkProject
              Services will be secure or free from bugs or viruses. You are
              responsible for checking their security and performance before
              using them and for using your own virus protection software.`}
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Miscellaneous
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              <ul className="list-disc pl-6">
                <li className="mb-4">
                  We may perform any of our obligations, and exercise any of the
                  rights granted to us under these Terms, through a third-party.
                  We may assign any or all our rights and obligations under
                  these Terms to any third-party.
                </li>
                <li className="mb-4">
                  If any of the provisions in these Terms are found to be
                  illegal, invalid or unenforceable by any court of competent
                  jurisdiction, the remainder shall continue in full force and
                  effect.
                </li>
                <li className="mb-4">
                  All disclaimers, indemnities and exclusions in these Terms
                  shall survive termination of the Terms and shall continue to
                  apply during any suspension or any period during which the
                  Services are not available for you to use for any reason
                  whatsoever.
                </li>
                <li className="mb-4">
                  These Terms and the documents referred to in them set out the
                  entire agreement between you and us with respect to your use
                  of the Services and supersede any and all prior or
                  contemporaneous representations, communications or agreements
                  (written or oral) made between you or us.
                </li>
              </ul>
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Governing Law and Dispute Resolution
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              The applicable law shall be French law. Any dispute, controversy,
              or claim arising out of or in relation to these Terms, including
              the validity, invalidity, breach or termination thereof, shall be
              submitted to the competent Court of Paris (France), except if
              otherwise provided by applicable law.
            </Typography>

            <Typography
              className="mb-6 mt-8"
              component="h2"
              variant="heading_light_s"
            >
              Contacting us
            </Typography>
            <Typography
              className="text-asteroid-grey-800 dark:text-asteroid-grey-100"
              component="p"
              variant="body_text_16"
            >
              Should you have any questions about these Terms, or wish to
              contact us for any reason whatsoever, please contact us by sending
              an email to{" "}
              <a
                className="text-space-blue-400 underline"
                href="mailto:account@arkproject.dev"
              >
                account@arkproject.dev
              </a>
            </Typography>
          </div>
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
