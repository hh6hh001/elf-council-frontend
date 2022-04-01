import {
  lockingVaultContract as lockingVault,
  vestingContract as vestingVault,
} from "src/elf/contracts";

const STARTING_BLOCK_NUMBER = 14496292;

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

  const delegators: string[] = [];

  lockingEvents.forEach((event) => {
    const value = event.args[2];
    const from = event.args[1];
    if (value.gt(0)) {
      delegators.push(from);
    }
  });

  //const ss = new Set<string>([]);
  vestingEvents.forEach((event) => {
    const value = event.args[2];
    const from = event.args[1];

    //ss.add(from);

    delegators.push(from);
    if (value.gt(0)) {
      delegators.push(from);
    }
  });

  //console.log("vestingEvents", ss.size, ss, vestingVault.address);

  // console.log(
  //   delegators,
  //   console.log(
  //     delegators.includes("0xfb0e31B422E606Ca996E4415243EBF15c2E5535E"),
  //   ),
  // );

  const y = new Set<string>(delegators);
  const uu = Array.from(y);
  console.log("y", y.size, y.has("0xfb0e31B422E606Ca996E4415243EBF15c2E5535E"));

  return Array.from(y);
}
