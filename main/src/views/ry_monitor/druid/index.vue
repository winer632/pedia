<template>
  <div>
    <i-frame v-model:src="url"></i-frame>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import iFrame from '@/components/iFrameRy'


const url = ref(import.meta.env.VITE_APP_BASE_API + '/druid/login.html');
</script>
