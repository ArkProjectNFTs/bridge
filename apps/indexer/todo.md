## TODO Starklane

- [x] indexer: Fix eth logs fetch to ensure request is never too big. For this,
limit to 500-1000 blocks slices.

- [ ] contracts: Rework the request hash to be compatible with ERC1155 and ERC721. On this new format,
depending contract type in the header -> the arrays lengths must match if not 0.
token_ids, token_amounts, token_uris.
For 721 -> ids and uris must match. Amounts is empty as it's always 1.
For 1155 -> ids and amounts must match. Uris is empty as URI is at contract level.

- [ ] contracts: When tokens are deposited, we need a salt from the front-end and not the request hash.
The request hash will be derived from the salt + request content.
Also, ensure that the request hash fits in a felt (clear the 6 left most bits).

- [ ] contracts: Add the quick claim and regular claim. Both must be exclusive, and done in the same
claimToken method. Just check the header for the claim method to be used + ensure
the claiming is possible.

- [ ] indexer: Optimisation: For now, the whole block range logs/events is kept in memory.
We do want to process the range once fetched, even if the range may be sliced into
smalled ranges. Like this, we ensure low RAM usage. (so, move the slice logic into indexing)
Also, if all the blocks in the range are already saved,
we can skip the whole range fetching.

- [ ] indexer: Fix logic when logs/events are identified, in order to have a store
transaction associated with each block. But how to solve this with race
between L1/L2 indexing?

- [ ] contracts: Rework the logs in solidity and events in cairo to fit the new nomenclature. We need
the request content on each event for now.
Check the event/logs structure to ensure in both chains the content is still the same.
In solidity, don't use string into data, but use bytes representation (check if for strings,
is not better this way though...)

- [ ] Add the thin API layer to serve data (axum). This may be a clap argument to choose
if the API must be started up or not (+ port). Maybe only an `Option<String>` being
the ip:port to bind.

- [ ] Add the quick claim tx to send the message hash to bridge contract if the users
paid to do so.
Add for that an external on the bridge L1 to accept (only from bridge owner address)
the registering of a message hash ready to be consumed.
ATTENTION: this must completely shadow the starknet messaging "consume_message".
We need to verify that someone can't write a contract and then claim again without
passing through the bridge.

- [ ] Add burn option on deposit. If burn option activated, the user
must do an other tx to burn the token as only token in escrow can be burnt.
Problem here, if the user sell the token he just bridged, do we need to restrict the
burn? Because this user will still registered as the "bridger" in the other chain...
Or we can also have automatic burn -> if the user pays for the eth tx to be sent,
exactly as the quick claim....!

- [ ] Verify the token URI on starknet seems to fail in utf-8.

- [ ] Complete documentation on the technical choices and architecture.

- [ ] If a collection is already deployed on L2 for instance, we need a mechanism to identify
the owner of the collection on L1 and authorize pre-register the address on L2 (from L1 to have this fully on chain).
Like this, nothing is deployed when tokens arrive -> only mintFromBridge.
Need an interface IERC[721/1155]Bridgeable that only consider the functions for the bridge actions.
Here is a great question... if a user try to bridge before the declaration of the address is made... then the token will be locked in escrow.
How can we prevent this...? The collection owner must do some communication then..!
