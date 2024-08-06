<template>
  <div class="chat-hint" @click="handlePrompt(props.title)">
    <div class="chat-hint-icon">
      <slot name="icon"></slot>
    </div>
    <div class="chat-hint-box">
      <div class="chat-hint-box-title">
        {{ props.title }}
      </div>
      <div class="chat-hint-box-desc">
        {{ props.desc }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps } from 'vue'

interface Props {
  id?: number
  title: string
  desc: string
}

const props = defineProps<Props>()

const handlePrompt = (title: string) => {

}

</script>
<style lang="scss" scoped>
.chat-hint0 {
  margin-right: 0.5rem;
}

.chat-hint1 {
  margin-left: 0.5rem;
}

.chat-hint {
  display: flex;
  border-radius: 0.5rem;
  background: #FFF;

  &-icon {
    padding: 1.25rem;
  }

  &-box {
    display: flex;
    flex-flow: column;
    justify-content: center;

    &-title {
      color: var(--theme-color-text);
      font-family: "PingFang SC";
      font-size: 0.875rem;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }

    &-desc {
      color: var(--theme-color-detail);
      font-family: "PingFang SC";
      font-size: 0.75rem;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }
}
</style>
