# Starklane: Ethererum.

Starklane, bridge for NTFs.

## Upgradeability

On ethereum, Starklane uses a [Transparent Upgradable Proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy#transparent_proxy)
associated with it's auxiliary `ProxyAdmin` contract (which is Ownable).

`Proxy` = The main proxy targetted by users, called by the front-end etc...
`ProxyAdmin` = auxiliary contract to execute admin tasks on the `Proxy`.

This pattern is used for:
1. The bridge contract itself, to be upgradable.
2. The ERC721Bridgeable, which makes possible for collection owner to get full control on their collection back.

What can be changed with this configuration:

* The `ProxyAdmin` is `Ownable`, then ownership can be changed with a `transferOwnership` call.
* The `ProxyAdmin` is the only contract that can call `upgradeTo` to change the `Proxy` implementation address.


