import AIView from "@/views/AIView.vue";
import MessageBridgeView from "@/views/MessageBridgeView.vue";
import StakeView from "@/views/StakeView.vue";
import TokenBridgeView from "@/views/TokenBridgeView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: [
    {
      path: "/",
      name: "token-bridge",
      component: TokenBridgeView,
    },
    {
      path: "/message-bridge",
      name: "message-bridge",
      component: MessageBridgeView,
    },
    {
      path: "/stake",
      name: "stake",
      component: StakeView,
    },
    {
      path: "/ai",
      name: "ai",
      component: AIView,
    },
  ],
});

export default router;
