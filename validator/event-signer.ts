import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Hex } from "viem";
import Config from "./config";

class EventSigner {
  async sign(uid: Hex): Promise<{ signature: string; signer: string }> {
    const signer = Ed25519Keypair.deriveKeypair(Config.secretKey());

    const signature = await signer.sign(new TextEncoder().encode(uid));

    return {
      signature: signature.toString(),
      signer: signer.getPublicKey().toIotaAddress(),
    };
  }
}

export { EventSigner };
