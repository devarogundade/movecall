<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import NotifyPop from '@/components/NotifyPop.vue';
import { initializeApp } from "firebase/app";

initializeApp({
  apiKey: import.meta.env.VITE_FS_API_KEY,
  authDomain: import.meta.env.VITE_FS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FS_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FS_APP_ID,
  measurementId: import.meta.env.VITE_FS_MEASUREMENT_ID,
});
</script>

<template>
  <AppHeader />
  <RouterView />
  <NotifyPop />
</template>