import type { Address } from "viem";

export const MAX_CHECKPOINT_LANE_LENGTH = 24;
export const MAX_CHECKPOINT_TITLE_LENGTH = 56;
export const MAX_CHECKPOINT_DETAIL_LENGTH = 180;

export const checkpointAbi = [
  {
    type: "function",
    name: "logCheckpoint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "lane", type: "string" },
      { name: "title", type: "string" },
      { name: "detail", type: "string" },
    ],
    outputs: [{ name: "checkpointId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getCheckpoint",
    stateMutability: "view",
    inputs: [{ name: "checkpointId", type: "uint256" }],
    outputs: [
      { name: "author", type: "address" },
      { name: "lane", type: "string" },
      { name: "title", type: "string" },
      { name: "detail", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextCheckpointId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export type CheckpointData = {
  author: Address;
  lane: string;
  title: string;
  detail: string;
  createdAt: bigint;
};

export const checkpointContractAddress = process.env
  .NEXT_PUBLIC_CHECKPOINT_CONTRACT_ADDRESS as Address | undefined;
