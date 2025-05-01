<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import NotifyPop from '@/components/NotifyPop.vue';
</script>

<template>
  <AppHeader />
  <RouterView />
  <NotifyPop />
</template>