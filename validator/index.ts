import axios from "axios";
import Config from "./config";
import { EventSigner } from "./event-signer";
import {
  TokenBridge,
  SignedTokenTransferEVM,
  SignedTokenTransferIOTA,
} from "./token-bridge";

const api = axios.create({ baseURL: Config.nodeUrl() });

const eventSigner = new EventSigner();
const tokenBridge = new TokenBridge();

tokenBridge.syncHolesky(async (events) => {
  try {
    const signedEvents: SignedTokenTransferEVM[] = [];
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      const { signature, signer } = await eventSigner.sign(event.uid);
      signedEvents.push({ ...event, signature, signer });
    }
    await api.post("/holesky-token-tranfer-events", signedEvents);
  } catch (error) {
    console.log(error);
  }
});

setInterval(
  () =>
    tokenBridge.callIOTA(async (events) => {
      try {
        const signedEvents: SignedTokenTransferIOTA[] = [];
        for (let index = 0; index < events.length; index++) {
          const event = events[index];
          const { signature, signer } = await eventSigner.sign(event.uid);
          signedEvents.push({ ...event, signature, signer });
        }
        await api.post("/iota-token-tranfers-events", signedEvents);
      } catch (error) {
        console.log(error);
      }
    }),
  Config.IOTA_EVENT_INTERVAL_MS
);
