import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { holesky } from "viem/chains";
import { walletConnect } from "@wagmi/connectors";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { NightlyConnectIotaAdapter } from "@nightlylabs/wallet-selector-iota";
import { ref } from "vue";

const metadata = {
  name: "App | MoveCall.",
  description: "App | MoveCall.",
  url: "https://movecall.netlify.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const appMetadata = {
  name: "App | MoveCall.",
  description: "App | MoveCall.",
  icon: "https://avatars.githubusercontent.com/u/37784886",
  additionalInfo: "MoveCall",
};

export const iotaClient = new IotaClient({
  url: getFullnodeUrl("testnet"),
});

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

const adapter = ref<NightlyConnectIotaAdapter | null>(null);

export const useAdapter = () => {
  const initAdapter = async () => {
    adapter.value = await NightlyConnectIotaAdapter.build({
      appMetadata,
    });
  };

  return { adapter, initAdapter };
};
