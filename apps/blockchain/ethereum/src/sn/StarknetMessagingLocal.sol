/*
  Copyright 2019-2022 StarkWare Industries Ltd.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  https://www.starkware.co/open-source-license/

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions
  and limitations under the License.
*/
// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "starknet/StarknetMessaging.sol";

/*
 * A superset of StarknetMessaging to support
 * local development by adding a way to directly register
 * a message hash ready to be consumed, without waiting the block
 * to be verified.
 */
contract StarknetMessagingLocal is StarknetMessaging {

    // A message hash was added directly.
    event AddedMessageHashFromL2(
        bytes32 indexed messageHash
    );

    /*
     * Adds the hash of a validated messaged from L2.
     */
    function addMessageHashFromL2(uint256 msgHash)
        external
        payable {

        // TODO: add guard for whitelisted sender?

        bytes32 hash = bytes32(msgHash);
        emit AddedMessageHashFromL2(hash);
        l2ToL1Messages()[hash] += 1;
    }

}
