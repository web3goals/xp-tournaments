"use client";

import { siteConfig } from "@/config/site";
import { tournamentAbi } from "@/contracts/abi/tournament";
import { addressToShortAddress } from "@/lib/converters";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/use-toast";
import useError from "@/hooks/useError";
import { formatEther, parseEther, zeroAddress } from "viem";
import { Loader2 } from "lucide-react";
import { StartTournamentDialog } from "./start-tournament-dialog";
import { xpAbi } from "@/contracts/abi/xp";
import { Badge } from "./ui/badge";

export function Tournament(props: { id: string }) {
  const [isDataReady, setIsDataReady] = useState(false);

  const { data: params, refetch: refetchParams } = useContractRead({
    address: siteConfig.contracts.tournament,
    abi: tournamentAbi,
    functionName: "getParams",
    args: [BigInt(props.id)],
  });

  const { data: owner } = useContractRead({
    address: siteConfig.contracts.tournament,
    abi: tournamentAbi,
    functionName: "ownerOf",
    args: [BigInt(props.id)],
  });

  useEffect(() => {
    setIsDataReady(false);
    if (params && owner) {
      setIsDataReady(true);
    }
  }, [params, owner]);

  if (!isDataReady) {
    return <Skeleton className="w-full h-[24px]" />;
  }

  return (
    <>
      <TournamentHeader
        id={props.id}
        params={params}
        onUpdate={() => refetchParams()}
      />
      <Separator className="my-6" />
      <TournamentProgress params={params} owner={owner} className={["my-12"]} />
      <TournamentTeam
        id={props.id}
        params={params}
        title="1️⃣ Team One"
        players={params!.teamOnePlayers as string[]}
        className={["my-12"]}
      />
      <TournamentTeam
        id={props.id}
        params={params}
        title="2️⃣ Team Two"
        players={params!.teamTwoPlayers as string[]}
        className={["my-12"]}
      />
    </>
  );
}

function TournamentHeader(props: {
  id: string;
  params: any;
  onUpdate: () => {};
  className?: ClassValue[];
}) {
  const { toast } = useToast();

  return (
    <div className={cn(props.className)}>
      {/* Title and description */}
      <div className="space-y-0.5">
        <div className="flex flex-col-reverse items-start space-y-1 lg:flex-row lg:items-center lg:space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">
            ⚔️ {props.params.name}
          </h2>
          <Badge variant="secondary">
            {props.params.game == BigInt(1) && "Counter-Strike 2"}
            {props.params.game == BigInt(2) && "Dota 2"}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Win to get all the XP, or lose everything
        </p>
      </div>
      {/* Actions */}
      <div className="flex flex-row mt-4 space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(
              `${global.window.location.origin}/tournaments/${props.id}`
            );
            toast({
              title: "Link copied!",
            });
          }}
        >
          Copy Link
        </Button>
        {!props.params.isStarted && (
          <StartTournamentDialog
            id={props.id}
            onStart={() => props.onUpdate()}
          />
        )}
        {props.params.isStarted &&
          !props.params.isTeamOneWon &&
          !props.params.isTeamTwoWon && (
            <TournamentFinishButton
              id={props.id}
              onFinish={() => props.onUpdate()}
            />
          )}
      </div>
    </div>
  );
}

function TournamentFinishButton(props: { id: string; onFinish: () => {} }) {
  const { handleError } = useError();
  const { toast } = useToast();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    try {
      setIsSubmitting(true);
      if (!walletClient) {
        throw new Error("Wallet is not connected");
      }
      if (chain?.id != siteConfig.contracts.chain.id) {
        throw new Error("Chain incorrect");
      }
      const { request } = await publicClient.simulateContract({
        address: siteConfig.contracts.tournament,
        abi: tournamentAbi,
        functionName: "finish",
        args: [BigInt(props.id)],
        account: address,
      });
      const txHash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      toast({
        title: "Tournament finished ⚔️",
      });
      props.onFinish();
    } catch (error: any) {
      handleError(error, true);
      setIsSubmitting(false);
    }
  }

  return (
    <Button disabled={isSubmitting} onClick={() => onSubmit()}>
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Finish
    </Button>
  );
}

function TournamentProgress(props: {
  params: any;
  owner: any;
  className?: ClassValue[];
}) {
  return (
    <div className={cn(props.className)}>
      <h3 className="text-xl font-semibold tracking-tight">🔥 Progress</h3>
      <div className="flex flex-col space-y-4 mt-4">
        <p className="text-muted-foreground">
          🏆 Tournament created by{" "}
          <a
            href={`${siteConfig.contracts.chain.blockExplorers.default.url}/address/${props.owner}`}
            target="_blank"
            className="font-medium text-primary underline underline-offset-4"
          >
            {addressToShortAddress(props.owner)}
          </a>
        </p>
        {props.params.isStarted && (
          <p className="text-muted-foreground">
            ⚔️ Tournament started, code is{" "}
            <span className="font-medium text-primary ">
              {props.params.code}
            </span>
          </p>
        )}
        {props.params.isTeamOneWon && (
          <p className="text-muted-foreground">
            🍾 Tournament finished,{" "}
            <span className="font-medium text-primary ">team onw won</span>{" "}
            {formatEther(
              BigInt(props.params.teamTwoPlayers.length) *
                props.params.contributionAmount
            )}{" "}
            XP
          </p>
        )}
        {props.params.isTeamTwoWon && (
          <p className="text-muted-foreground">
            🍾 Tournament finished,{" "}
            <span className="font-medium text-primary ">team two won</span>{" "}
            {formatEther(
              BigInt(props.params.teamOnePlayers.length) *
                props.params.contributionAmount
            )}{" "}
            XP
          </p>
        )}
      </div>
    </div>
  );
}

function TournamentTeam(props: {
  id: string;
  title: string;
  params: any;
  players: string[];
  className?: ClassValue[];
}) {
  return (
    <div className={cn(props.className)}>
      <h3 className="text-xl font-semibold tracking-tight">{props.title}</h3>
      <div className="mt-4 space-y-4">
        {props.players.map((player, index) => (
          <TournamentTeamPlayer
            key={index}
            id={props.id}
            params={props.params}
            player={player}
          />
        ))}
      </div>
    </div>
  );
}

function TournamentTeamPlayer(props: {
  id: string;
  params: any;
  player: string;
}) {
  const { handleError } = useError();
  const { toast } = useToast();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contribution, refetch: refetchContribution } = useContractRead({
    address: siteConfig.contracts.tournament,
    abi: tournamentAbi,
    functionName: "getContribution",
    args: [BigInt(props.id), props.player],
  });

  async function onSubmit() {
    try {
      setIsSubmitting(true);
      if (!walletClient) {
        throw new Error("Wallet is not connected");
      }
      if (chain?.id != siteConfig.contracts.chain.id) {
        throw new Error("Chain incorrect");
      }
      // Send request to approve contribution
      const { request: approveRequest } = await publicClient.simulateContract({
        address: siteConfig.contracts.xp,
        abi: xpAbi,
        functionName: "approve",
        args: [siteConfig.contracts.tournament, parseEther("1000000")],
        account: address,
      });
      const approveTxHash = await walletClient.writeContract(approveRequest);
      await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      // Send request to contribute
      const { request: contributeRequest } =
        await publicClient.simulateContract({
          address: siteConfig.contracts.tournament,
          abi: tournamentAbi,
          functionName: "contribute",
          args: [BigInt(props.id), props.player],
          account: address,
        });
      const contributeTxHash = await walletClient.writeContract(
        contributeRequest
      );
      await publicClient.waitForTransactionReceipt({ hash: contributeTxHash });
      toast({
        title: "Contribution succeeded 🪙",
      });
      refetchContribution();
    } catch (error: any) {
      handleError(error, true);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-row items-center space-x-4">
      <p className="font-semibold">{props.player}</p>
      {contribution == zeroAddress ? (
        <p className="text-muted-foreground">⌛ Not contributed</p>
      ) : (
        <p className="text-muted-foreground">
          ✅ Contributed{" "}
          <span className="font-medium text-primary">
            {formatEther(props.params.contributionAmount)} XP
          </span>{" "}
          by{" "}
          <a
            href={`${siteConfig.contracts.chain.blockExplorers.default.url}/address/${contribution}`}
            target="_blank"
            className="font-medium text-primary underline underline-offset-4"
          >
            {addressToShortAddress(contribution)}
          </a>
        </p>
      )}
      {contribution == zeroAddress && (
        <Button
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => onSubmit()}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          🪙 Contribute {formatEther(props.params.contributionAmount)} XP
        </Button>
      )}
    </div>
  );
}
