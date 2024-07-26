# ArkProject Bridge technical guide

ArkProject Bridge is a suite of tools for developers to easily bridge asset between Ethereum and Starknet.

It should not be seen as a very generic tool as Starkgate provides. As the considerations and implications of bridging a NFT are very different.

The current implementation of ArkProject Bridge is aiming at supporting both [ERC721](https://eips.ethereum.org/EIPS/eip-721) and [ERC1155](https://eips.ethereum.org/EIPS/eip-1155). In the case of ERC1155, there are economics implications of bridging assets that are beyond the scope of this document. The ERC721 is easier to handle due to the inherent uniqueness of a token.

# Considerations

Working with ERC721 and ERC1155 contracts has different constraints on Ethereum and Starknet. Indeed, Ethereum being more standardized at the moment of this writing, it’s easier to have some assumptions on what a contract must implement/expose using the [ERC165](https://eips.ethereum.org/EIPS/eip-165) specification.

- **ERC721**: The metadata (Token URI most importantly) for a token can be implemented in diverse manners. Using a base URI concatenating the token id, or having a string stored for each token. Even if the base URI is often use, we still see some URIs being stored.
We can see here the first choice to make when a token is bridged. Is the URI required to be explicit bridged for each token, or only bridging the base URI is sufficient.
This is then tied to what is the design choice made by the developer / collection owner. ArkProject Bridge supports both.
- **ERC1155**: Metadata for ERC1155 is from the beginning using a base URI. Which is implemented in this same fashion for every contracts. However, with ERC1155, the consideration is about economics and how to keep track of tokens amounts being bridge.
In fact, as token may not be unique - and even unique token are not guaranteed to be unique, the escrow mechanism to hold the tokens when bridged can’t follow the same logic as ERC721 escrow does.
This topic is still under discussion at Screenshot Labs, but the most viable option seems to be a burn of the tokens being bridged, and mint them again if they are bridged from the other chain.
But again, this is more about economics than technical consideration.
- **Cairo version**: ArkProject Bridge is being updated to be compliant with `v2.6.4`.
- **Starknet messaging asymmetry**: The native messaging proposed by Starknet is working differently based on which direction assets are bridged.
L1→L2: From a single transaction on Ethereum, the message is registered and emitted as an event by the Starknet Core Contract, and the sequencer is responsible of gathering those events to then send (automatically) a `L1Handler` transaction to the destination contract on Starknet.
L2→L1: When a transaction is made on Starknet with a message for Ethereum, the message is included in a block (Ethereum is not listening to events). Once this block is proven, Starknet Core Contract is capable of taking this message in account, and at this moment a transaction on Ethereum must be realized to actually consume the message (and thus execute the logic associated to it).
At the moment of this writing, the proving time is quite long for a good UX. For this reason, we propose to developer to use an indexer that is able to fire transactions on Ethereum reacting on the `requests` being included in a block (and emitted in an event). This transaction has more cost, and the developer / collection owner can choose to pay the costs upfront for his users, charge more fees at the moment of the deposit, or simply let the user do the withdraw when the block is proven without firing this transaction.
Important to note that this transaction to “consume the message before the block is being proved” is implemented in a way that even when the block is proven later, the “consume message” proposed by Starknet Core will be invalid. This ensure the tokens can’t be withdrawn two times.
- **Auto-deploy of contracts**: As some collection owner that are bridging may not have deployed a collection on the other chain to receive the token, ArkProject Bridge is auto-deploying a contract to receive the tokens if no collection address on the destination chain is given in the request. This contract is proxied on Ethereum, and upgradable on Starknet, to ensure that the owner can take back the full control without loosing the data.
Those auto-deployed contract implements the `IStarklaneBridgeable` interface, which ensures that the contract can receive/send token through ArkProject Bridge.
If the collection owner / developer already deployed a contract, this contract must implement `IStarklaneBridgeable` to interact with the bridge.

# Request protocol

ArkProject Bridge has a protocol designed to work around a `request` to bridge assets. A `request` is self explanatory about the collection and tokens to bridge.

A single `request` can bridge one or more tokens for **ONE** collection. To bridge assets of different collections, several `request` must be made.

The protocol is designed to allow evolution, and can also be customized by the developers to fit their needs. But the core functionality, logic and security is ensured by the `request` content and how it is handled on Ethereum and on Starknet.

This is the `request` that is serialized and sent as the payload of Starknet messaging. The type compatibility between Ethereum and Starknet is ensured by the `Cairo.sol` library, which is in charge to serialize / deserialize Cairo types into solidity associated types.

```rust
struct Request {
  	// Header of the request with protocol information.
  	// Defines the type of collection (ERC721/ERC1155), the deposit and withdraw strategies.
	header: felt252;
	// Unique hash of the request.
	hash: u256;

	// Address of the collection on Ethereum.
	collection_l1: EthAddress; 
	// Address of the collection on Starknet.
	collection_l2: ContractAddress;

	// Owner on Ethereum (for all the tokens in the request).
	owner_l1: EthAddress;
	// Owners on Starknet (for all the tokens in the request).
	owner_l2: ContractAddress;

	// Collection name (ERC1155: not used).
	name: string;
	// Collection symbol (ERC1155: not used).
	symbol: string;
	// Base URI for the collection.
	base_uri: string;

	// Tokens to be bridged.
	ids: u256[];

  	// Amounts for each token
  	// ERC721: not used.
  	// ERC1155: if empty, the amount is 1 for each token id, else length must match `ids`.
  	values: u256[];

  	// URIs for each individual token 
  	// ERC721: must be empty if `base_uri` is provided, else length must match `ids`.
  	// ERC1155: not used.
  	uris: string;

	// New owners on the destination layer. This allows a batch migration of the tokens to different owners.
	// Must be empty if `owner_l1` (arriving on Ethereum) or `owner_l2` (arriving on Starknet)
  	// is not 0. Otherwise, length must match `ids`.
	new_owners: felt252[];
}
```

- Withdraw strategies: When assets are bridge from Ethereum to Starknet, the withdraw is always `auto` as the transaction `L1Handler` is fired by the sequencer.
When transferring assets from Starknet to Ethereum, the withdraw strategies are:
`auto` ⇒ The indexer fires a transaction on Ethereum when the `request` is included in a block produced on starknet (but not yet proven) which triggers the automatic withdraw of the assets on L1.
`manual` ⇒ The withdraw of the assets will be possible only when the block in which the `request` was included is being proven. At this moment, the user must send a transaction to ArkProject Bridge contract on Ethereum to withdraw the assets.
- Deposit strategies:
`escrow` ⇒ The token is held on escrow by ArkProject Bridge contract. A token held on escrow by ArkProject Bridge contract may also be burnt by the collection owner (i.e.: When the token is safely bridge, and the collection owner wants to burn the collection after being bridged).
`burn-auto` ⇒ This one uses the same approach as the `withdraw-auto`, when the request is successfully processed (assets are bridged), the indexer fires a transaction on the other chain to burn the tokens. This works for both Ethereum and Starknet, as the messaging is asynchronous.
This is the safest way to automatically handle the burn, even if the cost is a bit higher.
TODO: May we consider separating a `burn` and `burn-auto`? To allow the same transaction to burn then bridge? But it’s very risky, for ERC721 especially as a burnt token can’t be minted again.

A `request` is identified by a `hash`. This hash is derived from the content of the request (token ids, owners, etc..), but also depends on a salt provided by the originator of the transaction. This salt is here because as some tokens may be in escrow, they can be bridge several time, in several directions. So the request may have the exact same content as a previous request. To ensure uniqueness of each request, this salt is used. An any attempt to replay a request with the same salt is denied.
The hash computation includes only one collection address, the collection address on the chain where tokens are deposited. This ensures uniqueness between chains without having to consult an external database.

# FSM

You can find a first representation of the FMS on this [figma](https://www.figma.com/file/esIDAZS1UySOAtq7hMa5xQ/FSM-For-Starklane---L1---L2?type=whiteboard&node-id=0-1&t=LqPt9ELDlcVdz29t-0).
We're currently reviewing and we will detail more some steps to ensure a better preparation for the audit and easier for someone to dive into the project.

