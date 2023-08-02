## TODO Starklane

- [ ] Fix eth logs fetch to ensure request is never too big. For this,
limit to 500-1000 blocks slices.

- [ ] Fix logic when logs/events are identified, in order to have a store
transaction associated with each block. But how to solve this with race
between L1/L2 indexing?

- [ ] Rework the logs in solidity and events in cairo to fit the new nomenclature. We need
the request content on each event for now.
Check the event/logs structure to ensure in both chains the content is still the same.
In solidity, don't use string into data, but use bytes representation (check if for strings,
is not better this way though...)

- [ ] On the bridge contract (L1 and L2), we should check for the approval manually.
Like this, we can emit an event Initiated[L1/L2]Error and directly expose the reason
on the UI thanks to the indexer. Without the need to go into the explorer.
So the execution must not revert -> to keep the logs.
Or do we revert, but it's not easy for us to expose the reason of the failure.
Or yes -> if the front-end follows the transaction, and can give the result as string!
(may be better like this...!)
!!!!!!
Neeed to check with Yohan, but as the front-end always check the approval... We should
not have problem for that, and only someone sending raw tx may have the problem, but
this person is more advanced and may check the explorer.

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
