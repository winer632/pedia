<template>
  <div class="qa">
    <div class="qa-header">
      <h1 class="qa-header-title">
        {{ title }}
      </h1>
      <el-input v-model="input" class="qa-header-input" :placeholder="inputPlaceholder"
        @keydown.enter="search" :suffix-icon="Search" />
    </div>
      <div class="qa-main">
        <div class="qa-main-create">
          <el-button type="primary" class="qa-main-create-button" @click="handleCreate">
            {{ t('page.qa.main.create') }}
          </el-button>
        </div>

        <div class="qa-main-list">
          <ChatList :filter="input" @loadData="loadLLM" />
        </div>
      </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue'

interface Props {
  title: string;
  input: string;
  inputPlaceholder: string;
}
interface Emits {
  (ev: 'onSearch'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const search = () => {
  emit('onSearch');
}

    </script>
<style lang="scss">
@import "../../assets/chat/layer.scss"
  </style>
