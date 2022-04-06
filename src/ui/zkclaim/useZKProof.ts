import { useCallback, useMemo, useReducer } from "react";
import {
  generateProofCallData,
  MerkleTree,
  pedersenHashConcat,
  toHex,
} from "zkp-merkle-airdrop-lib";
import { useQuery } from "react-query";
import {
  discordTier1PrivateAirdropContract,
  // discordTier2PrivateAirdropContract,
  // discordTier3PrivateAirdropContract,
  githubTier1PrivateAirdropContract,
  githubTier2PrivateAirdropContract,
  githubTier3PrivateAirdropContract,
} from "src/elf/contracts";
import { PrivateAirdrop } from "@elementfi/elf-council-typechain";

// TODO: Move cdn base url to environment variable
const cdnUrl = `https://elementfi.s3.us-east-2.amazonaws.com/rewards/${
  process.env.NEXT_PUBLIC_CHAIN_NAME || "testnet"
}/zkRetro`;

interface ProofState {
  error?: Error;
  isGenerating: boolean;
  proof?: string;
}

type ProofAction =
  | { type: "startGenerating" }
  | { type: "setProof"; payload: string }
  | { type: "setError"; payload: Error };

function reducer(state: ProofState, action: ProofAction): ProofState {
  switch (action.type) {
    case "startGenerating":
      return {
        error: undefined,
        isGenerating: true,
        proof: undefined,
      };
    case "setProof":
      return {
        error: undefined,
        isGenerating: false,
        proof: action.payload,
      };
    case "setError":
      return {
        error: action.payload,
        isGenerating: false,
        proof: undefined,
      };
    default:
      console.warn("Unsupported ProofState reducer action:", action);
      return state;
  }
}

export interface UseZKProofProps {
  key?: string;
  secret?: string;
  account?: string;
}

export interface MerkleTreeInfo {
  merkleTree: MerkleTree;
  contract: PrivateAirdrop;
}

interface UseZKProof extends ProofState, Partial<MerkleTreeInfo> {
  generate: () => Promise<string> | undefined;
  isEligible: boolean;
  isReady: boolean;
}

export default function useZKProof({
  key,
  secret,
  account,
}: UseZKProofProps): UseZKProof {
  const [state, dispatch] = useReducer(reducer, {
    isGenerating: false,
  });

  // fetch required files
  // TODO: fetch all trees
  const { data: githubMerkleTreeT1 } = useQuery({
    queryKey: "github-merkle-tree-1",
    queryFn: async () =>
      fetch(`${cdnUrl}/merkle/0x7198A8379fE0A0663A1E7020F6100F39b53bbB9e.txt`)
        .then((res) => res.text())
        .then((mtss) => MerkleTree.createFromStorageString(mtss)),
    staleTime: Infinity,
  });
  const { data: githubMerkleTreeT2 } = useQuery({
    queryKey: "github-merkle-tree-2",
    queryFn: async () =>
      fetch(`${cdnUrl}/merkle/0xd21A03818ffe26dD92AEeD030E8a4b920c25C1cd.txt`)
        .then((res) => res.text())
        .then((mtss) => MerkleTree.createFromStorageString(mtss)),
    staleTime: Infinity,
  });
  const { data: githubMerkleTreeT3 } = useQuery({
    queryKey: "github-merkle-tree-3",
    queryFn: async () =>
      fetch(`${cdnUrl}/merkle/0xd98BD503c766F2ee0Bf05A4f34dA50af5B71D051.txt`)
        .then((res) => res.text())
        .then((mtss) => MerkleTree.createFromStorageString(mtss)),
    staleTime: Infinity,
  });
  const { data: discordMerkleTreeT1 } = useQuery({
    queryKey: "discord-merkle-tree-1",
    queryFn: async () =>
      fetch(`${cdnUrl}/merkle/0x8c7a3457742bC7ae91Bec25ea9Ab5dCbEF412292.txt`)
        .then((res) => res.text())
        .then((mtss) => MerkleTree.createFromStorageString(mtss)),
    staleTime: Infinity,
  });
  // const { data: discordMerkleTreeT2 } = useQuery({
  //   queryKey: "discord-merkle-tree-1",
  //   queryFn: async () =>
  //     fetch(`${cdnUrl}/merkle/0x6E023DAF6D9B89491A86A4554651fBaF3b8402FE.txt`)
  //       .then((res) => res.text())
  //       .then((mtss) => MerkleTree.createFromStorageString(mtss)),
  //   staleTime: Infinity,
  // });
  // const { data: discordMerkleTreeT3 } = useQuery({
  //   queryKey: "discord-merkle-tree-1",
  //   queryFn: async () =>
  //     fetch(`${cdnUrl}/merkle/0x6923F46Bfbf87E01428b8a70B1B6737a982ABcdA.txt`)
  //       .then((res) => res.text())
  //       .then((mtss) => MerkleTree.createFromStorageString(mtss)),
  //   staleTime: Infinity,
  // });
  const treesReady = !!(
    (
      githubMerkleTreeT1 &&
      githubMerkleTreeT2 &&
      githubMerkleTreeT3 &&
      discordMerkleTreeT1
    ) //&&
    // discordMerkleTreeT2 &&
    // discordMerkleTreeT3
  );
  const { data: wasmBuffer } = useQuery({
    queryKey: "zk-wasm-buffer",
    queryFn: () =>
      fetch(`${cdnUrl}/circuit.wasm`)
        .then((res) => res.arrayBuffer())
        .then((ab) => Buffer.from(ab)),
    staleTime: Infinity,
  });
  const { data: zkeyBuffer } = useQuery({
    queryKey: "zk-zkey-buffer",
    queryFn: () =>
      fetch(`${cdnUrl}/circuit_final.zkey`)
        .then((res) => res.arrayBuffer())
        .then((ab) => Buffer.from(ab)),
    staleTime: Infinity,
  });

  // set isEligible when the key, secret, and/or merkleTree change
  const merkleTreeInfo = useMemo<MerkleTreeInfo | undefined>(() => {
    if (key && secret && treesReady) {
      let commitment: string;

      // OK to catch, as it throws in the case of being not eligible
      try {
        commitment = toHex(pedersenHashConcat(BigInt(key), BigInt(secret)));
      } catch (e) {
        return undefined;
      }

      const merkleTrees = [
        {
          merkleTree: githubMerkleTreeT1,
          contract: githubTier1PrivateAirdropContract,
        },
        {
          merkleTree: githubMerkleTreeT2,
          contract: githubTier2PrivateAirdropContract,
        },
        {
          merkleTree: githubMerkleTreeT3,
          contract: githubTier3PrivateAirdropContract,
        },
        {
          merkleTree: discordMerkleTreeT1,
          contract: discordTier1PrivateAirdropContract,
        },
        // {
        //   merkleTree: discordMerkleTreeT2,
        //   contract: discordTier2PrivateAirdropContract,
        // },
        // {
        //   merkleTree: discordMerkleTreeT3,
        //   contract: discordTier3PrivateAirdropContract,
        // },
      ];
      for (const treeInfo of merkleTrees) {
        const leafExists = treeInfo.merkleTree.leafExists(BigInt(commitment));
        if (leafExists) {
          return treeInfo;
        }
      }
    }
  }, [
    key,
    secret,
    treesReady,
    githubMerkleTreeT1,
    githubMerkleTreeT2,
    githubMerkleTreeT3,
    discordMerkleTreeT1,
    // discordMerkleTreeT2,
    // discordMerkleTreeT3,
  ]);

  const isReady = !!(treesReady && wasmBuffer && zkeyBuffer);

  const generate = useCallback(() => {
    if (isReady && merkleTreeInfo && key && secret && account) {
      dispatch({ type: "startGenerating" });
      return generateProofCallData(
        merkleTreeInfo?.merkleTree,
        // the last 2 characters represent the MSB which are removed by the
        // pedersenHash function when creating the commitment (public ID). To
        // generate a valid proof, they need to be removed here too.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        BigInt(key.slice(0, 64)),
        // the last 2 characters represent the MSB which are removed by the
        // pedersenHash function when creating the commitment (public ID). To
        // generate a valid proof, they need to be removed here too.
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        BigInt(secret.slice(0, 64)),
        account,
        wasmBuffer,
        zkeyBuffer,
      )
        .then((proof) => {
          dispatch({ type: "setProof", payload: proof });
          return proof;
        })
        .catch((err) => {
          dispatch({ type: "setError", payload: err });
          return err?.message || "";
        });
    }
  }, [key, secret, account, merkleTreeInfo, wasmBuffer, zkeyBuffer, isReady]);

  return {
    generate,
    isReady,
    isEligible: !!merkleTreeInfo,
    ...state,
    ...merkleTreeInfo,
  };
}
