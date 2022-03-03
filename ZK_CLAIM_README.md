`import { * as zkpLib } from zkp-merkle-airdrop-lib`

## 1. Pull merkle tree and static files

Will be fetched from AWS. Below code is from another example.

```javascript
const DOMAIN = "http://localhost:3000";
const merkleTreeStorageString = await getFileString(`${DOMAIN}/mt_8192.txt`);
const wasmBuff = await getFileBuffer(`${DOMAIN}/circuit.wasm`);
const zkeyBuff = await getFileBuffer(`${DOMAIN}/circuit_final.zkey`);
```

## 2. Create the merkle tree from the merkle tree file

```javascript
const merkleTree = zkpLib.MerkleTree.createFromStorageString(
  merkleTreeStorageString,
);
```

## 3. Create commitment with key and secret

```javascript
const computedCommitment = zkpLib.toHex(
  zkpLib.pedersenHashConcat(BigInt(key), BigInt(secret)),
);
```

## 4. Check if commitment is in the merkle tree

```javascript
const isEligible = merkleTree.leafExists(BigInt(computedCommitment));
```

## 5. Generate proof

This is a long-running (20s-60s) function that could be run in a worker. Wallet
needs to be connected by this point.

```javascript
const proof = await zkpLib.generateProofCallData(
  merkleTree,
  BigInt(key),
  BigInt(secret),
  address, // user wallet address (useWeb3React().account)
  wasmBuff,
  zkeyBuff,
);
```

## 6. Claim and delegate with the PrivateAirdrop contract

```javascript

```
