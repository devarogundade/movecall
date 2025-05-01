import { holesky } from "viem/chains";
import { walletConnect } from "@wagmi/connectors";
import { defaultWagmiConfig } from "@web3modal/wagmi";

const metadata = {
  name: "Token Bridge | MoveCall.",
  description: "Token Bridge | MoveCall.",
  url: "https://tokenBridge.deeplayr.xyz",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const chains = [holesky];

export const config = defaultWagmiConfig({
  // @ts-ignore
  chains,
  projectId: import.meta.env.VITE_PROJECT_ID,
  metadata,
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_PROJECT_ID,
    }),
  ],
});
