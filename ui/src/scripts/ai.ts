import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  or,
  orderBy,
  limit,
} from "firebase/firestore";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

const app = initializeApp({
  apiKey: import.meta.env.VITE_FS_API_KEY,
  authDomain: import.meta.env.VITE_FS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FS_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FS_APP_ID,
  measurementId: import.meta.env.VITE_FS_MEASUREMENT_ID,
});
const db = getFirestore(app);

type Chat = {
  text: string;
  from: string;
  to: string;
  timestampMs: number;
};

const CHAT_COLLECTION: string = "movecall-chats";

const AI = {
  id: "movecall",
  knowledge: `
  You're an AI agent (MoveCall AI), you know about the concept of cross chain messaging and token bridge, and IOTA blockchain.
  
  Interoperability on the IOTA blockchain refers to the ability of IOTA to communicate and exchange data or value with other blockchains and systems, enabling seamless interaction across different networks.
  
  MoveCall is an advanced interoperability protocol built on the IOTA blockchain, enabling cross-chain token transfers and arbitrary message passing with high scalability and efficiency. MoveCall introduces two core pipelines:
  Token Bridge – for seamless asset transfers between IOTA and other blockchain ecosystems.
  Message Bridge – for sending arbitrary data and commands across chains.

  By leveraging IOTA’s architecture and MoveCall’s secure design, the protocol unlocks seamless connectivity across chains, empowering dApps, users, and enterprises to build cross-chain experiences with trust and performance.

  MoveCall is secured through economic staking, where validators must either:
  Stake native IOTA coins, or
  Restake IOTA Liquid Staked Tokens (LSTs)

  STRATEGIES
  Stakable IOTA or Liquid Staked Tokens (LSTs) used to secure the network and earn rewards.

  VALIDATORS
  Nodes that stake IOTA or LSTs to verify cross-chain transactions and maintain bridge security.

  VaLIDATOR’S NOde
  MoveCall validator’s software, connects chains, processes bridge requests, and earns rewards.

  https://movecall.netlify.app
  Website

  https://github.com/devarogundade/movecall
  GitHub

  User can bridge token on https://movecall.netlify.app
  `,

  getChats(from: string, callback: (chats: Chat[]) => void) {
    try {
      const chatsRef = collection(db, CHAT_COLLECTION);
      const chatsQuery = query(
        chatsRef,
        or(where("from", "==", from), where("to", "==", from)),
        orderBy("timestampMs", "desc"),
        limit(50)
      );
      onSnapshot(chatsQuery, async (snapshot) => {
        const chats = snapshot.docs.map((chat) => chat.data());
        callback(chats as any);
      });
    } catch (error) {}
  },

  async chat(from: string, text: string): Promise<void> {
    try {
      const in_chat: Chat = {
        text,
        from,
        to: this.id,
        timestampMs: Date.now(),
      };

      await addDoc(collection(db, CHAT_COLLECTION), in_chat);

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "user", content: text },
          { role: "system", content: this.knowledge },
        ],
        model: "gpt-4o-mini",
      });

      if (
        completion.choices.length == 0 ||
        !completion.choices[0].message.content
      ) {
        const err_chat: Chat = {
          text: "Failed to respond.",
          from: this.id,
          to: from,
          timestampMs: Date.now(),
        };
        await addDoc(collection(db, CHAT_COLLECTION), err_chat);
        return;
      }

      const out_chat: Chat = {
        text: completion.choices[0].message.content,
        from: this.id,
        to: from,
        timestampMs: Date.now(),
      };
      await addDoc(collection(db, CHAT_COLLECTION), out_chat);
    } catch (error) {
      console.log(error);
    }
  },
};

export { type Chat, AI };
