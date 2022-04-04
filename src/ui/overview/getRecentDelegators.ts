import {
  lockingVaultContract as lockingVault,
  vestingContract as vestingVault,
} from "src/elf/contracts";

const STARTING_BLOCK_NUMBER = 14496292;
const MAX_WHITELIST = 2000;

export interface WhitelistData {
  address: string;
  block: number;
}

// Fetches the number of unique delegators from both locking and vesting vaults
// This function should be used within NextJs getStaticProps with a TTL to cache this result
export async function getRecentDelegators(): Promise<{
  whitelist: string[];
  whitelistData: WhitelistData[];
  blockNumbers: number[];
}> {
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

  // const delegators: Set<string> = new Set();
  const blockNumbers: Array<number> = [];
  const whitelist: Set<string> = new Set();
  const whitelistData: Array<WhitelistData> = [];

  const allEvents = lockingEvents.concat(vestingEvents);
  const sortedEvents = allEvents.sort(
    (eventA, eventB) => eventA.blockNumber - eventB.blockNumber,
  );

  sortedEvents.forEach((event) => {
    if (event.args) {
      const from = event.args.from;
      const value = event.args.amount;

      if (value.gt(0) && whitelist.size < MAX_WHITELIST) {
        whitelist.add(from);
        whitelistData.push({ address: from, block: event.blockNumber });
        blockNumbers.push(event.blockNumber);
      }
    }
  });

  return {
    whitelist: Array.from(whitelist.values()),
    whitelistData,
    blockNumbers,
  };
}
