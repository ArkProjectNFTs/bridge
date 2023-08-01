///! For now only mongo store is used locally,
///! Any new store can be added (i.e. dynamodb) implementing
///! the traits in store.rs.

pub mod mongo;
pub mod store;
