"use client";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  PanelTop,
  RadioTower,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  checkpointAbi,
  checkpointContractAddress,
  MAX_CHECKPOINT_DETAIL_LENGTH,
  MAX_CHECKPOINT_LANE_LENGTH,
  MAX_CHECKPOINT_TITLE_LENGTH,
} from "@/lib/checkpoint";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function dateLabel(createdAt?: bigint) {
  if (!createdAt) return "--";
  return new Date(Number(createdAt) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CheckpointApp() {
  const [checkpointIdInput, setCheckpointIdInput] = useState("1");
  const [lane, setLane] = useState("Build");
  const [title, setTitle] = useState("Shipped mobile wallet connect");
  const [detail, setDetail] = useState(
    "Tightened the first-screen flow, reduced clutter, and made the action obvious on mobile.",
  );
  const [status, setStatus] = useState(
    "Log one checkpoint on Base so your daily progress has a public timestamp.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: writing,
    error: writeError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }
  const parsedCheckpointId = BigInt(Math.max(1, Number(checkpointIdInput || "1")));

  const checkpointQuery = useReadContract({
    abi: checkpointAbi,
    address: checkpointContractAddress,
    functionName: "getCheckpoint",
    args: [parsedCheckpointId],
    query: {
      enabled: Boolean(checkpointContractAddress),
      refetchInterval: 12000,
    },
  });

  const totalQuery = useReadContract({
    abi: checkpointAbi,
    address: checkpointContractAddress,
    functionName: "nextCheckpointId",
    query: {
      enabled: Boolean(checkpointContractAddress),
      refetchInterval: 12000,
    },
  });

  const checkpointTuple = checkpointQuery.data as
    | readonly [Address, string, string, string, bigint]
    | undefined;

  const checkpoint = useMemo(
    () =>
      checkpointTuple
        ? {
            author: checkpointTuple[0],
            lane: checkpointTuple[1],
            title: checkpointTuple[2],
            detail: checkpointTuple[3],
            createdAt: checkpointTuple[4],
          }
        : undefined,
    [checkpointTuple],
  );

  const totalLogged = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;

  const canPost =
    Boolean(checkpointContractAddress) &&
    isConnected &&
    chainId === base.id &&
    lane.trim().length > 0 &&
    lane.trim().length <= MAX_CHECKPOINT_LANE_LENGTH &&
    title.trim().length > 0 &&
    title.trim().length <= MAX_CHECKPOINT_TITLE_LENGTH &&
    detail.trim().length > 0 &&
    detail.trim().length <= MAX_CHECKPOINT_DETAIL_LENGTH;

  const statusText = confirmed
    ? "Checkpoint confirmed on Base."
    : writeError
      ? writeError.message
      : status;

  function postCheckpoint() {
    if (!checkpointContractAddress) return;
    setStatus("Confirm the checkpoint in your wallet.");
    writeContract({
      address: checkpointContractAddress,
      abi: checkpointAbi,
      functionName: "logCheckpoint",
      args: [lane.trim(), title.trim(), detail.trim()],
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[#07111a] text-[#edf3f8]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#163348_0%,#07111a_48%,#050a10_100%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between border-b border-[#86f7bf]/15 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[12px] border border-[#86f7bf]/35 bg-[#0d1a24] shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <PanelTop className="h-5 w-5 text-[#86f7bf]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#86f7bf]">
                  Base Checkpoint
                </p>
                <h1 className="text-xl font-black sm:text-2xl">
                  Log one step. Keep shipping.
                </h1>
              </div>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#86f7bf]/20 bg-[#0d1a24] px-3 py-2 text-sm font-semibold text-[#d8e5ef]">
                  {shortAddress(address)}
                </span>
                <button
                  className="rounded-full border border-[#86f7bf]/35 bg-[#86f7bf] px-4 py-2 text-sm font-semibold text-[#07111a]"
                  onClick={disconnectWallet}
                >{disconnecting ? "Disconnecting" : "Disconnect"}</button>
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#86f7bf]/35 bg-[#86f7bf] px-4 py-2 text-sm font-semibold text-[#07111a] disabled:opacity-60"
                disabled={availableConnectors.length === 0 || connecting}
                onClick={connectWallet}
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                Connect
              </button>
            )}
          {walletStatus ? (
            <p className="w-full text-right text-xs font-semibold opacity-75">
              {walletStatus}
            </p>
          ) : null}
        </header>

          <div className="grid flex-1 gap-4 py-4 xl:grid-cols-[minmax(0,1.2fr)_430px]">
            <section className="order-2 rounded-[28px] border border-[#86f7bf]/16 bg-[linear-gradient(180deg,rgba(11,25,36,0.98)_0%,rgba(7,17,26,0.96)_100%)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] xl:order-1">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#86f7bf]/24 bg-[#0c1721] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#86f7bf]">
                    <RadioTower className="h-3.5 w-3.5" />
                    Daily onchain progress
                  </p>
                  <h2 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl xl:text-6xl">
                    A sharp checkpoint board for build days, study days, and ship days.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[#9eb0bc] sm:text-lg">
                    Write one concrete update, send it on Base, and keep a timestamped
                    record that shows what moved forward today.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[22px] border border-[#86f7bf]/20 bg-[#0d1822] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Total logged
                    </p>
                    <p className="mt-3 text-4xl font-black text-white">
                      {totalLogged || "00"}
                    </p>
                    <p className="mt-2 text-sm text-[#8ba0ad]">Checkpoints already on Base</p>
                  </div>
                  <div className="rounded-[22px] border border-[#3a5568] bg-[#0a141d] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#82a9c0]">
                      Board status
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {confirmed ? "Confirmed" : "Ready to log"}
                    </p>
                    <p className="mt-2 text-sm text-[#8ba0ad]">
                      One short action point per entry keeps the board readable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  ["1", "Pick a lane", "Build, Study, Train, Launch"],
                  ["2", "Write one step", "Short, concrete, easy to scan"],
                  ["3", "Log on Base", "Public record with time attached"],
                ].map(([step, label, sub]) => (
                  <div
                    key={step}
                    className="rounded-[22px] border border-[#173042] bg-[#0b1721] p-4"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7fc8a4]">
                      Step {step}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{label}</p>
                    <p className="mt-1 text-sm text-[#88a0af]">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-[#86f7bf]/18 bg-[#0a151f] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#183244] pb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Live checkpoint
                    </p>
                    <h3 className="mt-2 text-3xl font-black text-white">
                      {checkpoint?.title || "Shipped mobile wallet connect"}
                    </h3>
                  </div>
                  <div className="rounded-full border border-[#86f7bf]/20 bg-[#0d1a24] px-3 py-2 text-sm font-semibold text-[#dce8ee]">
                    {checkpoint?.lane || "Build"}
                  </div>
                </div>

                <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-[22px] border border-[#183244] bg-[#08121a] p-4">
                    <p className="text-sm leading-7 text-[#dce8ee]">
                      {checkpoint?.detail ||
                        "Tightened the first-screen flow, reduced clutter, and made the action obvious on mobile."}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[20px] border border-[#183244] bg-[#08121a] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                        Author
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {checkpoint?.author && checkpoint.author !== ZERO_ADDRESS
                          ? shortAddress(checkpoint.author)
                          : "--"}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-[#183244] bg-[#08121a] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                        Date
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {dateLabel(checkpoint?.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-[#183244] bg-[#08121a] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">Stored on Base</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] border border-[#173042] bg-[#0b1721] p-4">
                  <Activity className="h-5 w-5 text-[#86f7bf]" />
                  <p className="mt-3 text-lg font-semibold text-white">Readable streak log</p>
                  <p className="mt-1 text-sm text-[#88a0af]">
                    Best for daily progress, build notes, and public accountability.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#173042] bg-[#0b1721] p-4">
                  <CheckCircle2 className="h-5 w-5 text-[#86f7bf]" />
                  <p className="mt-3 text-lg font-semibold text-white">One action per card</p>
                  <p className="mt-1 text-sm text-[#88a0af]">
                    The board stays clean because each checkpoint stays narrow and concrete.
                  </p>
                </div>
                <div className="rounded-[22px] border border-[#173042] bg-[#0b1721] p-4">
                  <ArrowUpRight className="h-5 w-5 text-[#86f7bf]" />
                  <p className="mt-3 text-lg font-semibold text-white">Fast lookup</p>
                  <p className="mt-1 text-sm text-[#88a0af]">
                    Pull any checkpoint by ID and see who shipped what and when.
                  </p>
                </div>
              </div>
            </section>

            <aside className="order-1 flex flex-col gap-4 xl:order-2">
              <section className="rounded-[28px] border border-[#86f7bf]/18 bg-[#0a151f] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[#132330] text-[#86f7bf]">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">New checkpoint</h3>
                    <p className="text-sm text-[#93a7b5]">
                      Log one concrete move from today.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Lane
                    </span>
                    <input
                      value={lane}
                      onChange={(event) => setLane(event.target.value)}
                      maxLength={MAX_CHECKPOINT_LANE_LENGTH}
                      className="mt-2 w-full rounded-[18px] border border-[#214055] bg-[#09131b] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-[#577080]"
                      placeholder="Build"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Title
                    </span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={MAX_CHECKPOINT_TITLE_LENGTH}
                      className="mt-2 w-full rounded-[18px] border border-[#214055] bg-[#09131b] px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-[#577080]"
                      placeholder="Shipped mobile wallet connect"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Detail
                    </span>
                    <textarea
                      value={detail}
                      onChange={(event) => setDetail(event.target.value)}
                      maxLength={MAX_CHECKPOINT_DETAIL_LENGTH}
                      rows={5}
                      className="mt-2 w-full rounded-[18px] border border-[#214055] bg-[#09131b] px-4 py-3 text-base leading-7 text-white outline-none placeholder:text-[#577080]"
                      placeholder="Describe what moved forward today."
                    />
                  </label>

                  {!isConnected ? (
                    <button
                      className="w-full rounded-[18px] border border-[#86f7bf]/35 bg-[#86f7bf] px-4 py-3 text-base font-semibold text-[#07111a]"
                      onClick={connectWallet}
                    >
                      Connect wallet
                    </button>
                  ) : chainId !== base.id ? (
                    <button
                      className="w-full rounded-[18px] border border-[#f7c786]/35 bg-[#f7c786] px-4 py-3 text-base font-semibold text-[#07111a] disabled:opacity-60"
                      disabled={switching}
                      onClick={() => switchChain({ chainId: base.id })}
                    >
                      {switching ? "Switching..." : "Switch to Base"}
                    </button>
                  ) : (
                    <button
                      className="w-full rounded-[18px] border border-[#86f7bf]/35 bg-[#86f7bf] px-4 py-3 text-base font-semibold text-[#07111a] disabled:opacity-60"
                      disabled={!canPost || writing || confirming}
                      onClick={postCheckpoint}
                    >
                      {writing || confirming ? "Logging..." : "Log on Base"}
                    </button>
                  )}

                  <p className="text-sm leading-6 text-[#93a7b5]">{statusText}</p>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#3a5568] bg-[#0a151f] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <h3 className="text-3xl font-black text-white">Lookup board</h3>
                <p className="mt-1 text-sm text-[#93a7b5]">
                  Pull one checkpoint by ID.
                </p>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7fc8a4]">
                      Checkpoint ID
                    </span>
                    <input
                      value={checkpointIdInput}
                      onChange={(event) => setCheckpointIdInput(event.target.value)}
                      inputMode="numeric"
                      className="mt-2 w-full rounded-[18px] border border-[#214055] bg-[#09131b] px-4 py-3 text-base font-semibold text-white outline-none"
                    />
                  </label>

                  <div className="rounded-[22px] border border-[#183244] bg-[#08121a] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                      Current record
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {checkpoint?.title || "Waiting for first checkpoint"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#8ca1af]">
                      {checkpoint?.detail ||
                        "Once a checkpoint exists onchain, this panel shows its lane, date, and author."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-[#183244] bg-[#08121a] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                        Lane
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {checkpoint?.lane || "--"}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-[#183244] bg-[#08121a] p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fc8a4]">
                        Date
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {dateLabel(checkpoint?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
