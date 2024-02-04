import { defineChain } from "viem";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  emoji: "🏆",
  name: "XP Tournaments",
  description: "Launch tournaments, beat opponents, earn XP",
  links: {
    github: "https://github.com/web3goals/xp-tournaments-prototype",
  },
  contracts: {
    chain: defineChain({
      id: 1891,
      name: "Pegasus Testnet",
      network: "pegasus",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: ["https://replicator.pegasus.lightlink.io/rpc/v1"],
        },
        public: {
          http: ["https://replicator.pegasus.lightlink.io/rpc/v1"],
        },
      },
      blockExplorers: {
        default: {
          name: "Pegasus Testnet Explorer",
          url: "https://pegasus.lightlink.io/",
        },
      },
      testnet: true,
    }),
    xp: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59" as `0x${string}`,
    tournament: "0x02008a8DBc938bd7930bf370617065B6B0c1221a" as `0x${string}`,
  },
};
