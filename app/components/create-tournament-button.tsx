"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";

export function CreateTournamentButton() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(address != undefined);
  }, [address]);

  return (
    <>
      {isConnected ? (
        <Link href="tournaments/create">
          <Button size="lg">Create Tournament</Button>
        </Link>
      ) : (
        <Button size="lg" onClick={() => openConnectModal?.()}>
          Create Tournament
        </Button>
      )}
    </>
  );
}
