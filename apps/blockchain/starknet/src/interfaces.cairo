use starknet::ClassHash;

/// Upgradeable contract.
#[starknet::interface]
trait IUpgradeable<T> {
    fn upgrade(ref self: T, class_hash: ClassHash);
}

/// TODO: define events here when possible? Is it possible? Test it.

// #[derive(Drop, starknet::Event)]
// struct ReplacedClassHash {
//     contract: ContractAddress,
//     class: ClassHash,
// }

