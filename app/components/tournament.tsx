"use client";

import { siteConfig } from "@/config/site";
import { tournamentAbi } from "@/contracts/abi/tournament";
import { addressToShortAddress } from "@/lib/converters";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "./ui/use-toast";

export function Tournament(props: { id: string }) {
  const [isDataReady, setIsDataReady] = useState(false);

  const { data: params } = useContractRead({
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
      <TournamentHeader id={props.id} params={params} />
      <Separator className="my-6" />
      <TournamentProgress params={params} owner={owner} className={["my-12"]} />
      <TournamentTeamSection
        title="1️⃣ Team One"
        players={params!.teamOnePlayers as string[]}
        className={["my-12"]}
      />
      <TournamentTeamSection
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
  className?: ClassValue[];
}) {
  const { toast } = useToast();

  return (
    <div className={cn(props.className)}>
      {/* Title and description */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          ⚔️ {props.params.name}
        </h2>
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
        {/* TODO: Implement button */}
        {!props.params.isStarted && <Button>Start</Button>}
        {/* TODO: Implement button */}
        {props.params.isStarted &&
          !props.params.isTeamOneWon &&
          !props.params.isTeamTwoWon && <Button>Finish</Button>}
      </div>
    </div>
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
        {/* TODO: Display real data */}
        {props.params.isTeamOneWon && (
          <p className="text-muted-foreground">
            🍾 Tournament finished, team one won and got ❓ XP
          </p>
        )}
        {/* TODO: Display real data */}
        {props.params.isTeamTwoWon && (
          <p className="text-muted-foreground">
            🍾 Tournament finished, team two won and got ❓ XP
          </p>
        )}
      </div>
    </div>
  );
}

function TournamentTeamSection(props: {
  title: string;
  players: string[];
  className?: ClassValue[];
}) {
  return (
    <div className={cn(props.className)}>
      <h3 className="text-xl font-semibold tracking-tight">{props.title}</h3>
      <div className="mt-4">
        {props.players.map((player, index) => (
          <div key={index} className="flex flex-row items-center">
            {/* TODO: Display real data */}
            <div className="flex-1 flex flex-row space-x-4">
              <p className="font-semibold">{player}</p>
              <p>⌛ Not contributed</p>
            </div>
            {/* TODO: Implement button */}
            <Button size="sm">🪙 Contribute 50 XP</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
