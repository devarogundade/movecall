import dotenv from "dotenv";
import { CoinStruct, getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Config } from "config";

dotenv.config();

const client = new IotaClient({
  url: getFullnodeUrl("testnet"),
});

const signer = Ed25519Keypair.deriveKeypair(Config.secretKey());

const getCoins = async (
  coinType: string,
  owner: string
): Promise<CoinStruct[]> => {
  try {
    const coins = await client.getCoins({
      coinType,
      owner,
    });
    return coins.data;
  } catch (error) {
    return [];
  }
};

const Coins = [
  {
    coinType: `${Config.moveCall(0)}::btc::BTC`,
    module: "btc",
    witness: "BTC",
    treasuryCap:
      "0xf490545c8f2796814fab90670a334fdbdb9e1c265489d3deaae2265cec6b8a0a",
    faucet:
      "0x22991bb114d1b8e55ec4ebf9fecbee9852547ae4074e9ff2d608c98edb94da14",
  },
  {
    coinType: `${Config.moveCall(0)}::link::LINK`,
    module: "link",
    witness: "LINK",
    treasuryCap:
      "0x830cbeeaecb6d30bd4169ec76f03d836c6619c695958c13977efe917ec216d65",
    faucet:
      "0xd8a6c419af49332bac05f4e54eb8788034699bf45741855f48ebf541ea7edcba",
  },
  {
    coinType: `${Config.moveCall(0)}::usdc::USDC`,
    module: "usdc",
    witness: "USDC",
    treasuryCap:
      "0x3a8112ba3e035898d210497c26fc8d60fad2753e084bc5f5d8b4f8c7c9586e1b",
    faucet:
      "0xf5f68b27a72bd41db7b66db2b841348736dc5dbb35f62f468a3920c9ea15d056",
  },
  {
    coinType: `${Config.moveCall(0)}::eth::ETH`,
    module: "eth",
    witness: "ETH",
    treasuryCap:
      "0x403bb46d4672880b5312aa05c945ebf1bfb0a9c8210b536031d991de7ba89114",
    faucet:
      "0x4473808e57a74fa202fb781fe0d850ccbc974931c252c8b88ee1df95d5f05b4f",
  },
  {
    coinType: `${Config.moveCall(0)}::doge::DOGE`,
    module: "doge",
    witness: "DOGE",
    treasuryCap:
      "0xc6e23980573b7c9da18945ed351df295cb380fdb2b06da025de8a323beec2d81",
    faucet:
      "0x218535db301e8217b5475a065f60300b0c0dda8170e4c94a639444427aa4e340",
  },
  {
    coinType: `${Config.moveCall(0)}::akiota::AKIOTA`,
    module: "akiota",
    witness: "AKIOTA",
    treasuryCap:
      "0x8661064095151957dda73de22f3c52dd1c7b19d987394d313ddf71143a133934",
    faucet:
      "0x4c0622200c6861780656daf3f6cab8c6c6284f1a401d1e6f3a90c4c43e6f02da",
  },
];

export { client, signer, Coins, getCoins };
