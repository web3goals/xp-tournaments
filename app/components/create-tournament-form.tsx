"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { siteConfig } from "@/config/site";
import { tournamentAbi } from "@/contracts/abi/tournament";
import useError from "@/hooks/useError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { decodeEventLog, parseEther } from "viem";
import {
  useAccount,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

export function CreateTournamentForm() {
  const router = useRouter();
  const { handleError } = useError();
  const { toast } = useToast();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2),
    game: z.string().min(1),
    teamOnePlayers: z.string().min(2),
    teamTwoPlayers: z.string().min(2),
    contributionAmount: z.coerce.number().int().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      game: "1",
      teamOnePlayers: "",
      teamTwoPlayers: "",
      contributionAmount: 2,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);
      if (!walletClient) {
        throw new Error("Wallet is not connected");
      }
      if (chain?.id != siteConfig.contracts.chain.id) {
        throw new Error("Chain incorrect");
      }
      const teamOnePlayers = values.teamOnePlayers
        .split("\n")
        .filter((element) => element);
      const teamTwoPlayers = values.teamTwoPlayers
        .split("\n")
        .filter((element) => element);
      const { request } = await publicClient.simulateContract({
        address: siteConfig.contracts.tournament,
        abi: tournamentAbi,
        functionName: "create",
        args: [
          values.name,
          BigInt(values.game),
          teamOnePlayers,
          teamTwoPlayers,
          parseEther(String(values.contributionAmount)),
          siteConfig.contracts.xp,
        ],
        account: address,
      });
      const txHash = await walletClient.writeContract(request);
      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      let id: string | undefined;
      for (const log of txReceipt.logs) {
        const decodedLog = decodeEventLog({
          abi: tournamentAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decodedLog.eventName === "Transfer") {
          id = decodedLog.args.tokenId.toString();
        }
      }
      if (!id) {
        throw new Error("Error when reading a transaction, try again");
      }
      router.push(`/tournaments/${id}`);
      toast({
        title: "Tournament created 🤘",
      });
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="The Great Tournament" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="game"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Counter-Strike 2</SelectItem>
                  <SelectItem value="2">Dota 2</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamOnePlayers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team One Players</FormLabel>
              <FormControl>
                <Textarea placeholder={"kiv1n\n..."} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamTwoPlayers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Two Players</FormLabel>
              <FormControl>
                <Textarea placeholder={"lexus\n..."} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contributionAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Participation Contribution (XP)</FormLabel>
              <FormControl>
                <Input placeholder="5" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </form>
    </Form>
  );
}
