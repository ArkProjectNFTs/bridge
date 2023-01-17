# Starklane

The Starklane NFT Bridge: seamless transfer of NFTs between ETH L1 &amp; Starknet L2. Smart contracts, user-friendly interface, secure &amp; efficient solution. Experience the future of NFT ownership today

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Quickstart

### Install dependencies

`yarn`

### Build all packages

`yarn build`

## Ethereum

##### Build your contract:
```yarn build:l1```
or
```npx run hardhat compile``` in the blockchain folder

##### Deploy your contract:
```npx hardhat run --network <your-network> scripts/deploy.js```

##### Verify your contract your contract:
```npx hardhat verify --network goerli <your_deploy_contract> 0xde29d060D45901Fb19ED6C6e959EB22d8626708e```
*where "0xde29d060D45901Fb19ED6C6e959EB22d8626708e" is the starknetCore contract*

## Starknet

##### Build your contract:
```$ protostar build```

##### Declare your contract:
```$ protostar declare ./build/main.json```

##### Deploy your contract:
```$  protostar deploy your_class_hash```

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
