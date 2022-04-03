import { BigNumber } from "ethers";
import {
  lockingVaultContract as lockingVault,
  vestingContract as vestingVault,
} from "src/elf/contracts";

const STARTING_BLOCK_NUMBER = 14496292;
const MAX_WHITELIST = 2000;

// Fetches the number of unique delegators from both locking and vesting vaults
// This function should be used within NextJs getStaticProps with a TTL to cache this result
export async function getRecentDelegators(): Promise<string[]> {
  // Query for all events
  const lockingFilter = lockingVault.filters.VoteChange(null, null, null);
  const vestingFilter = vestingVault.filters.VoteChange(null, null, null);

  const lockingEvents = await lockingVault.queryFilter(
    lockingFilter,
    STARTING_BLOCK_NUMBER,
  );
  const vestingEvents = await vestingVault.queryFilter(
    vestingFilter,
    STARTING_BLOCK_NUMBER,
  );

  const delegators: Set<string> = new Set();

  const sortedEvents = lockingEvents
    .concat(vestingEvents)
    .sort((eventA, eventB) => eventB.blockNumber - eventA.blockNumber);

  sortedEvents.forEach((event) => {
    // VoteChange(to, from, amount)
    if (event.args) {
      const from: string = event.args[1];
      const value: BigNumber = event.args[2];

      if (value.gt(0) && delegators.size < MAX_WHITELIST) {
        delegators.add(from);
      }
    }
  });

  return Array.from(delegators);
}
