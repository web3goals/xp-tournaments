import { sepolia } from "wagmi";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  emoji: "🏆",
  name: "XP Tournaments",
  description: "Launch tournaments, beat opponents, earn XP",
  links: {
    github: "https://github.com/web3goals/xp-tournaments-prototype",
  },
  contracts: {
    chain: sepolia,
    xp: "0x418d621b98Cc75a09327725620F9ec949615396E" as `0x${string}`,
    tournament: "0x47f1758bE232710F03a9621C1058EF16C3a6158a" as `0x${string}`,
  },
};
