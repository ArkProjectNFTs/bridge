# Starklane

The Starklane NFT Bridge: seamless transfer of NFTs between ETH L1 &amp; Starknet L2. Smart contracts, user-friendly interface, secure &amp; efficient solution. Experience the future of NFT ownership today

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

##

## ➡️ L1 - L2 Flow

- The L1 gateway sends a message to the L2 gateway

- The L2 bridge contract verifies the presence of the L1 address in the registry structure `_l1_to_l2_addresses`

- If the L2 contract doesn't exist, the Universal Deployer Contract is automatically called to deploy a default ERC-721 contract, resulting in a replica of the L1 contract on L2.

- The bridge contract has the authority to mint a new token on the deployed smart contract.

## ⬅️ L2 - L1 Flow

TBD

## Quickstart

### Install dependencies

`yarn`

### Build all packages

`yarn build`

## Disclaimer

These contracts are only given as an example. They HAVE NOT undergone any audit. They SHOULD NOT be used for any production level application.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/remiroyc"><img src="https://avatars.githubusercontent.com/u/11146088?v=4?s=100" width="100px;" alt="Rémi"/><br /><sub><b>Rémi</b></sub></a><br /><a href="https://github.com/ScreenshotLabs/starklane/commits?author=remiroyc" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kwiss"><img src="https://avatars.githubusercontent.com/u/243668?v=4?s=100" width="100px;" alt="Christophe"/><br /><sub><b>Christophe</b></sub></a><br /><a href="https://github.com/ScreenshotLabs/starklane/commits?author=kwiss" title="Code">💻</a> <a href="#design-kwiss" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gershon"><img src="https://avatars.githubusercontent.com/u/55589?v=4?s=100" width="100px;" alt="Paul"/><br /><sub><b>Paul</b></sub></a><br /><a href="https://github.com/ScreenshotLabs/starklane/commits?author=gershon" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
